import express from 'express';
import { requireAuth } from '../../../middleware/auth.js';

export function Feedbacks(app: express.Express) {
  // Busca feedbacks da empresa com paginação
  app.get('/api/protected/user/feedbacks', requireAuth, async (req, res) => {
    const supabase = req.supabase!;
    const user = req.user!;

    // Parâmetros de paginação
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Parâmetros de filtro
    const rating = req.query.rating
      ? parseInt(req.query.rating as string)
      : null;
    const search = (req.query.search as string) || '';

    try {
      // Primeiro, buscar a empresa do usuário
      const { data: enterprise, error: enterpriseError } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (enterpriseError || !enterprise) {
        return res.status(404).json({ error: 'enterprise_not_found' });
      }

      // Construir query base
      let query = supabase
        .from('feedback')
        .select(
          `
          id,
          message,
          rating,
          created_at,
          updated_at,
          collection_points!inner(
            id,
            name,
            type,
            identifier
          ),
          tracked_devices(
            id,
            device_fingerprint,
            user_agent,
            ip_address,
            feedback_count,
            is_blocked,
            customer_id,
            customer(
              id,
              name,
              email,
              gender
            )
          )
        `,
        )
        .eq('enterprise_id', enterprise.id)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (rating) {
        query = query.eq('rating', rating);
      }

      if (search) {
        query = query.ilike('message', `%${search}%`);
      }

      // Buscar total de registros para paginação (query separada)
      const { count, error: countError } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .eq('enterprise_id', enterprise.id);

      if (countError) {
        return res.status(500).json({ error: 'failed_to_count_feedbacks' });
      }

      // Buscar dados com paginação
      const { data: feedbacks, error: feedbacksError } = await query.range(
        offset,
        offset + limit - 1,
      );

      if (feedbacksError) {
        return res.status(500).json({ error: 'failed_to_fetch_feedbacks' });
      }

      // Calcular informações de paginação
      const totalPages = Math.ceil((count || 0) / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return res.json({
        feedbacks: feedbacks || [],
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count || 0,
          itemsPerPage: limit,
          hasNextPage,
          hasPreviousPage,
        },
      });
    } catch (error) {
      console.error('Erro ao buscar feedbacks:', error);
      return res.status(500).json({ error: 'internal_server_error' });
    }
  });

  // Busca estatísticas dos feedbacks
  app.get(
    '/api/protected/user/feedbacks/stats',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      try {
        // Buscar a empresa do usuário
        const { data: enterprise, error: enterpriseError } = await supabase
          .from('enterprise')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (enterpriseError || !enterprise) {
          return res.status(404).json({ error: 'enterprise_not_found' });
        }

        // Buscar estatísticas
        const { data: stats, error: statsError } = await supabase
          .from('feedback')
          .select('rating')
          .eq('enterprise_id', enterprise.id);

        if (statsError) {
          return res.status(500).json({ error: 'failed_to_fetch_stats' });
        }

        // Calcular estatísticas
        const totalFeedbacks = stats?.length || 0;
        const averageRating =
          totalFeedbacks > 0
            ? stats.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
            : 0;

        const ratingDistribution = {
          1: stats?.filter((f) => f.rating === 1).length || 0,
          2: stats?.filter((f) => f.rating === 2).length || 0,
          3: stats?.filter((f) => f.rating === 3).length || 0,
          4: stats?.filter((f) => f.rating === 4).length || 0,
          5: stats?.filter((f) => f.rating === 5).length || 0,
        };

        const positiveFeedbacks = ratingDistribution[4] + ratingDistribution[5];
        const negativeFeedbacks = ratingDistribution[1] + ratingDistribution[2];
        const neutralFeedbacks = ratingDistribution[3];

        return res.json({
          totalFeedbacks,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution,
          sentimentBreakdown: {
            positive: positiveFeedbacks,
            neutral: neutralFeedbacks,
            negative: negativeFeedbacks,
          },
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return res.status(500).json({ error: 'internal_server_error' });
      }
    },
  );
}
