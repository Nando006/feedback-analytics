import express from 'express';
import { createSupabaseServerClient } from '../../supabase.js';

export function EndpointsEnterprise(app: express.Express) {
  // Busca informações públicas de uma empresa para validação
  app.get('/api/public/enterprise/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'enterprise_id_required' });
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
        return res.status(404).json({ error: 'enterprise_not_found' });
      }

      return res.json({
        id: enterprise.id,
        name: enterprise.name || 'Empresa',
      });
    } catch (err) {
      console.error('Erro ao buscar empresa:', err);
      return res.status(500).json({ error: 'internal_server_error' });
    }
  });
}
