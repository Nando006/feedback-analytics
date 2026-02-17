import express from 'express';
import { createSupabaseServerClient } from '../../supabase.js';
import {
  API_ERROR_ENTERPRISE_ID_REQUIRED,
  API_ERROR_ENTERPRISE_NOT_FOUND,
  API_ERROR_INTERNAL_SERVER_ERROR,
} from '../../constants/errors.js';
import { sendTypedError } from '../../utils/sendTypedError.js';

export function EndpointsEnterprise(app: express.Express) {
  // Busca informações públicas de uma empresa para validação
  app.get('/api/public/enterprise/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return sendTypedError(res, 400, API_ERROR_ENTERPRISE_ID_REQUIRED);
    }

    const supabase = createSupabaseServerClient(req, res);

    try {
      // Buscar dados básicos da empresa usando a view pública
      const { data: enterprise, error } = await supabase
        .from('enterprise_public')
        .select('id, name')
        .eq('id', id)
        .single();

      if (error || !enterprise) {
        return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
      }

      return res.json({
        id: enterprise.id,
        name: enterprise.name || 'Empresa',
      });
    } catch (err) {
      console.error('Erro ao buscar empresa:', err);
      return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
    }
  });
}
