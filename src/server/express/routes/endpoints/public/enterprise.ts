import express from 'express';
import { createSupabaseServerClient } from 'src/server/express/supabase';

export function EnterprisePublic(app: express.Express) {
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
        .from('enterprise_public_ids')
        .select('id, document, account_type')
        .eq('id', id)
        .single();

      if (error || !enterprise) {
        return res.status(404).json({ error: 'enterprise_not_found' });
      }

      // Gerar nome baseado nos dados disponíveis
      let enterpriseName = 'Empresa';

      if (enterprise.document) {
        // Usar documento formatado como nome
        const doc = enterprise.document;
        if (enterprise.account_type === 'CNPJ' && doc.length === 14) {
          enterpriseName = `Empresa ${doc.slice(0, 2)}.${doc.slice(
            2,
            5,
          )}.${doc.slice(5, 8)}`;
        } else {
          enterpriseName = `Empresa ${doc.slice(0, 3)}***`;
        }
      }

      return res.json({
        id: enterprise.id,
        name: enterpriseName,
      });
    } catch (err) {
      console.error('Erro ao buscar empresa:', err);
      return res.status(500).json({ error: 'internal_server_error' });
    }
  });
}
