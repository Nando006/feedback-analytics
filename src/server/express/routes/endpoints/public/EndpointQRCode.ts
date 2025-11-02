import express from 'express';
import { qrcodeFeedbackSchema } from '../../../../../../lib/schemas/public/feedbackSchema.js';
import { createSupabaseServerClient } from '../../../supabase.js';
import crypto from 'node:crypto';

export function EndpointPostQRCodeFeedback(app: express.Express) {
  // Recebe feedback público via QR Code
  app.post('/api/public/qrcode/feedback', async (req, res) => {
    const parsed = qrcodeFeedbackSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_payload' });
    }

    const payload = parsed.data;
    const supabase = createSupabaseServerClient(req, res);

    // Verifica se a enterprise existe
    const { data: enterpriseRow, error: enterpriseErr } = await supabase
      .from('enterprise_public')
      .select('id')
      .eq('id', payload.enterprise_id)
      .single();

    if (enterpriseErr || !enterpriseRow) {
      return res.status(404).json({ error: 'enterprise_not_found' });
    }

    // Gera fingerprint do dispositivo (UA + IP + dia) - versão simplificada
    const userAgent = req.get('user-agent') || '';
    const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';

    // Gerar fingerprint localmente (mesmo algoritmo da função RPC)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Início do dia
    const dayEpoch = Math.floor(today.getTime() / 1000);

    const fingerprintData = `${userAgent}|${clientIP}|${dayEpoch}`;
    const deviceFingerprint = crypto
      .createHash('md5')
      .update(fingerprintData)
      .digest('hex');

    // 1. Buscar collection_point do tipo QR_CODE para a empresa (não criar no fluxo público)
    const { data: collectionPoint, error: cpErr } = await supabase
      .from('collection_points')
      .select('id')
      .eq('enterprise_id', payload.enterprise_id)
      .eq('type', 'QR_CODE')
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (cpErr) {
      console.error('Erro ao buscar collection_point:', cpErr);
      return res.status(500).json({ error: 'collection_point_error' });
    }

    if (!collectionPoint) {
      return res.status(404).json({ error: 'collection_point_not_found' });
    }

    // 2. Buscar ou criar dispositivo rastreado PRIMEIRO
    const { data: initialTrackedDevice, error: deviceErr } = await supabase
      .from('tracked_devices')
      .select('id, last_feedback_at, is_blocked, feedback_count, customer_id')
      .eq('enterprise_id', payload.enterprise_id)
      .eq('device_fingerprint', deviceFingerprint)
      .maybeSingle();

    let trackedDevice = initialTrackedDevice;

    if (deviceErr) {
      console.error('Erro ao verificar dispositivo:', deviceErr);
      return res.status(500).json({ error: 'device_check_failed' });
    }

    // Verifica se dispositivo está bloqueado
    if (trackedDevice?.is_blocked) {
      console.log('Dispositivo bloqueado');
      return res.status(403).json({ error: 'DEVICE_BLOCKED' });
    }

    // Verifica se já enviou feedback hoje
    if (trackedDevice?.last_feedback_at) {
      const lastFeedback = new Date(trackedDevice.last_feedback_at);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (lastFeedback >= today) {
        console.log('Dispositivo já enviou feedback hoje');
        return res.status(409).json({ error: 'DEVICE_ALREADY_SUBMITTED' });
      }
    }

    // 2.5. Criar/buscar customer se dados foram fornecidos
    let customerId: string | null = null;

    if (payload.customer_name || payload.customer_email) {

      // Verificar se customer já existe por email (se fornecido)
      let existingCustomer = null;
      if (payload.customer_email) {
        const { data: customerByEmail } = await supabase
          .from('customer')
          .select('id')
          .eq('enterprise_id', payload.enterprise_id)
          .eq('email', payload.customer_email)
          .maybeSingle();

        existingCustomer = customerByEmail;
      }

      if (existingCustomer) {
        console.log('Cliente existente encontrado por email');
        customerId = existingCustomer.id;
      } else {
        // Criar novo customer
        console.log('Criando novo cliente');

        // Mapear gender do frontend para o formato do banco
        let genderForDB = null;
        if (payload.customer_gender) {
          const genderMap: Record<string, string> = {
            masculino: 'Masculino',
            feminino: 'Feminino',
            outro: 'Outro',
            prefiro_nao_informar: 'Não Informado',
          };
          genderForDB = genderMap[payload.customer_gender] || null;
        }

        const { data: newCustomer, error: customerErr } = await supabase
          .from('customer')
          .insert({
            enterprise_id: payload.enterprise_id,
            name: payload.customer_name || null,
            email: payload.customer_email || null,
            gender: genderForDB,
          })
          .select('id')
          .single();

        if (customerErr) {
          console.error('Erro ao criar cliente:', customerErr);
          // Não falha o feedback por isso, mas loga
        } else if (newCustomer) {
          customerId = newCustomer.id;
          console.log('Cliente criado com ID:', customerId);
        }
      }
    }

    // Se não existe dispositivo, criar primeiro
    if (!trackedDevice) {
      console.log('Criando novo dispositivo rastreado');
      const { data: newDevice, error: createDeviceErr } = await supabase
        .from('tracked_devices')
        .insert({
          enterprise_id: payload.enterprise_id,
          customer_id: customerId, // RELAÇÃO COM CUSTOMER!
          device_fingerprint: deviceFingerprint,
          user_agent: userAgent,
          ip_address: clientIP,
          last_feedback_at: new Date().toISOString(),
          feedback_count: 0, // Será incrementado após inserir o feedback
          is_blocked: false,
        })
        .select('id, feedback_count, last_feedback_at, is_blocked, customer_id')
        .single();

      if (createDeviceErr || !newDevice) {
        console.error('Erro ao criar dispositivo:', createDeviceErr);
        return res.status(500).json({ error: 'device_creation_failed' });
      }

      trackedDevice = newDevice;
    } else if (customerId && !trackedDevice.customer_id) {
      // Se dispositivo existe mas não tem customer_id, atualizar
      console.log('Atualizando dispositivo existente com customer_id');
      await supabase
        .from('tracked_devices')
        .update({ customer_id: customerId })
        .eq('id', trackedDevice.id);
    }

    // 3. Inserir feedback na tabela COM tracked_device_id (sem RETURNING para evitar RLS no SELECT)
    const { error: feedbackErr } = await supabase
      .from('feedback')
      .insert({
        enterprise_id: payload.enterprise_id,
        collection_point_id: collectionPoint.id,
        tracked_device_id: trackedDevice!.id, // RELAÇÃO CORRETA!
        message: payload.message,
        rating: payload.rating,
      });

    if (feedbackErr) {
      console.error('Erro ao inserir feedback:', feedbackErr);
      return res.status(500).json({ error: 'feedback_insert_failed' });
    }

    // 4. Atualizar dispositivo com novo feedback
    const { error: updateErr } = await supabase
      .from('tracked_devices')
      .update({
        last_feedback_at: new Date().toISOString(),
        feedback_count: (trackedDevice!.feedback_count || 0) + 1,
        user_agent: userAgent,
        ip_address: clientIP,
      })
      .eq('id', trackedDevice!.id);

    if (updateErr) {
      console.error('Erro ao atualizar dispositivo:', updateErr);
      // Não falha o feedback por isso, mas loga o erro
    }

  return res.json({ ok: true });
  });
}
