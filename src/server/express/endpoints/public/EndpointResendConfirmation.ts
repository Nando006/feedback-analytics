import express from 'express';
import { sendTypedError } from '../../../../../lib/utils/sendTypedError';
import { API_ERROR_INVALID_PAYLOAD } from '../../../../../lib/constants/server/errors';
import { createSupabaseServerClient } from '../../supabase';

export function EndpointResendConfirmation(app: express.Express) {
  app.post('/api/public/auth/resend-confirmation', async (req, res) => {
    const { email } = req.body;
    if(!email || typeof email !== 'string') {
      return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
    }

    const supabase = createSupabaseServerClient(req, res);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        return sendTypedError(res, 400, error.message || 'Falha ao reenviar e-mail.'); 
      }

      return res.json({
        ok: true,
        message: 'E-mail de confirmação reenviado com sucesso.'
      })
    } catch (err) {
      return sendTypedError(res, 500, 'Erro interno ao reenviar e-mail');
    }
  })
}