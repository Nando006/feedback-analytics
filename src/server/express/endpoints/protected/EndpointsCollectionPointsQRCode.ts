import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  API_ERROR_COLLECTION_POINT_ERROR,
  API_ERROR_ENTERPRISE_NOT_FOUND,
  API_ERROR_UNABLE_TO_ACTIVATE_QR,
  API_ERROR_UNABLE_TO_CREATE_QR_CP,
  API_ERROR_UNABLE_TO_DISABLE_QR,
} from '../../constants/errors.js';
import { sendTypedError } from '../../utils/sendTypedError.js';

export function EndpointsCollectionPointsQRCode(app: express.Express) {
  // Status do QR (se há CP ativo)
  app.get(
    '/api/protected/user/collection-points/qr/status',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      const { data: enterprise, error: enterpriseError } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (enterpriseError || !enterprise) {
        return sendTypedError(
          res,
          404,
          API_ERROR_ENTERPRISE_NOT_FOUND,
          { active: false },
        );
      }

      const { data: cp, error: cpError } = await supabase
        .from('collection_points')
        .select('id')
        .eq('enterprise_id', enterprise.id)
        .eq('type', 'QR_CODE')
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (cpError) {
        return sendTypedError(
          res,
          500,
          API_ERROR_COLLECTION_POINT_ERROR,
          { active: false },
        );
      }

      return res.json({ active: !!cp, id: cp?.id ?? null });
    },
  );

  // Habilitar QR (cria se não existir, ativa se existir)
  app.post(
    '/api/protected/user/collection-points/qr/enable',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      const { data: enterprise, error: enterpriseError } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (enterpriseError || !enterprise) {
        return sendTypedError(
          res,
          404,
          API_ERROR_ENTERPRISE_NOT_FOUND,
        );
      }

      // Já ativo?
      const { data: activeCP } = await supabase
        .from('collection_points')
        .select('id')
        .eq('enterprise_id', enterprise.id)
        .eq('type', 'QR_CODE')
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (activeCP) {
        return res.json({ id: activeCP.id, active: true });
      }

      // Existe algum CP de QR? Ativa-o; senão cria um novo
      const { data: anyCP } = await supabase
        .from('collection_points')
        .select('id')
        .eq('enterprise_id', enterprise.id)
        .eq('type', 'QR_CODE')
        .maybeSingle();

      if (anyCP) {
        const { error: updErr } = await supabase
          .from('collection_points')
          .update({ status: 'ACTIVE', name: 'QR Code' })
          .eq('id', anyCP.id);

        if (updErr) {
          return sendTypedError(
            res,
            500,
            API_ERROR_UNABLE_TO_ACTIVATE_QR,
          );
        }

        return res.json({ id: anyCP.id, active: true });
      }

      const { data: newCP, error: createErr } = await supabase
        .from('collection_points')
        .insert({
          enterprise_id: enterprise.id,
          type: 'QR_CODE',
          status: 'ACTIVE',
          name: 'QR Code',
        })
        .select('id')
        .single();

      if (createErr || !newCP) {
        return sendTypedError(
          res,
          500,
          API_ERROR_UNABLE_TO_CREATE_QR_CP,
        );
      }

      return res.json({ id: newCP.id, active: true });
    },
  );

  // Desabilitar QR (coloca INACTIVE se estiver ativo)
  app.post(
    '/api/protected/user/collection-points/qr/disable',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      const { data: enterprise, error: enterpriseError } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (enterpriseError || !enterprise) {
        return sendTypedError(
          res,
          404,
          API_ERROR_ENTERPRISE_NOT_FOUND,
        );
      }

      const { data: cp } = await supabase
        .from('collection_points')
        .select('id')
        .eq('enterprise_id', enterprise.id)
        .eq('type', 'QR_CODE')
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (!cp) {
        return res.json({ active: false });
      }

      const { error: updErr } = await supabase
        .from('collection_points')
        .update({ status: 'INACTIVE' })
        .eq('id', cp.id);

      if (updErr) {
        return sendTypedError(
          res,
          500,
          API_ERROR_UNABLE_TO_DISABLE_QR,
        );
      }

      return res.json({ active: false });
    },
  );
}
