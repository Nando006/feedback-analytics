import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  analyzeFeedbacksForEnterprise,
  IaStudioServiceError,
} from '../../services/iaStudioService.js';

export function EndpointsIAStudio(app: express.Express) {
  app.post(
    '/api/protected/ia-studio/send-message',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      const limit =
        typeof req.body?.limit === 'number' && req.body.limit > 0
          ? req.body.limit
          : undefined;

      try {
        const result = await analyzeFeedbacksForEnterprise({
          supabase,
          userId: user.id,
          options: { limit },
        });

        return res.json(result);
      } catch (error) {
        if (error instanceof IaStudioServiceError) {
          if (error.code === 'invalid_ai_response') {
            // Se for problema de JSON da IA, vale logar o detalhe se existir no ambiente de logs
            console.error('Resposta inválida da IA no IA Studio:', error);
          }

          return res.status(error.statusCode).json({ error: error.code });
        }

        console.error('Erro inesperado no endpoint IA Studio:', error);
        return res.status(500).json({ error: 'internal_server_error' });
      }
    },
  );
}