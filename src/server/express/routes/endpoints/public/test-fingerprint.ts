import express from 'express';
import { createSupabaseServerClient } from 'src/server/express/supabase';

export function TestFingerprint(app: express.Express) {
  app.get('/api/public/test-fingerprint', async (req, res) => {
    const supabase = createSupabaseServerClient(req, res);

    const userAgent = req.get('user-agent') || 'test-agent';
    const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';

    console.log('=== TESTE FINGERPRINT ===');
    console.log('User-Agent:', userAgent);
    console.log('Client IP:', clientIP);

    try {
      // Teste 1: Chamar função RPC
      console.log('Testando RPC...');
      const { data: fingerprintResult, error: fingerprintErr } =
        await supabase.rpc('generate_device_fingerprint', {
          user_agent_param: userAgent,
          ip_address_param: clientIP,
        });

      console.log('Resultado RPC:', { fingerprintResult, fingerprintErr });

      if (fingerprintErr) {
        return res.json({
          success: false,
          error: 'RPC failed',
          details: fingerprintErr,
          userAgent,
          clientIP,
        });
      }

      return res.json({
        success: true,
        fingerprint: fingerprintResult,
        userAgent,
        clientIP,
      });
    } catch (err) {
      console.error('Erro no teste:', err);
      return res.json({
        success: false,
        error: 'Exception caught',
        details: err,
        userAgent,
        clientIP,
      });
    }
  });
}
