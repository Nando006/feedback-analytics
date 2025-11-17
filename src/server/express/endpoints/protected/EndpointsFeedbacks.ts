import express from 'express';
import { requireAuth } from '../../middleware/auth.js';

export function EndpointsFeedbacks(app: express.Express) {
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

  // Relatório global de insights (resumo + recomendações) gerado pela IA
  app.get(
    '/api/protected/user/feedbacks/insights/report',
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

        const { data: report, error } = await supabase
          .from('feedback_insights_report')
          .select('summary, recommendations, updated_at')
          .eq('enterprise_id', enterprise.id)
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar feedback_insights_report:', error);
          return res
            .status(500)
            .json({ error: 'failed_to_fetch_feedback_insights_report' });
        }

        if (!report) {
          return res.json({
            summary: null,
            recommendations: [],
            updatedAt: null,
          });
        }

        return res.json({
          summary: (report.summary as string | null) ?? null,
          recommendations: ((report.recommendations ??
            []) as string[]).filter((rec) => !!rec && rec.trim().length > 0),
          updatedAt: (report.updated_at as string | null) ?? null,
        });
      } catch (error) {
        console.error('Erro ao buscar relatório de insights (IA):', error);
        return res.status(500).json({ error: 'internal_server_error' });
      }
    },
  );

  // Busca análises de feedbacks geradas pela IA (feedback_analysis)
  app.get(
    '/api/protected/user/feedbacks/analysis',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      // Filtro opcional por sentimento: positive | neutral | negative
      const sentimentFilter = (req.query.sentiment as
        | 'positive'
        | 'neutral'
        | 'negative'
        | undefined) ?? undefined;

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

        // Buscar feedbacks com análise associada
        let query = supabase
          .from('feedback')
          .select(
            `
            id,
            message,
            rating,
            created_at,
            feedback_analysis:feedback_analysis (
              sentiment,
              categories,
              keywords
            )
          `,
          )
          .eq('enterprise_id', enterprise.id);

        if (sentimentFilter) {
          query = query.eq('feedback_analysis.sentiment', sentimentFilter);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Erro ao buscar análises de feedbacks:', error);
          return res
            .status(500)
            .json({ error: 'failed_to_fetch_feedback_analysis' });
        }

        const itemsRaw = (data ?? []).filter(
          (row: any) => row.feedback_analysis,
        ) as {
          id: string;
          message: string;
          rating: number | null;
          created_at: string;
          feedback_analysis: {
            sentiment: 'positive' | 'neutral' | 'negative';
            categories: string[] | null;
            keywords: string[] | null;
          };
        }[];

        if (itemsRaw.length === 0) {
          return res.json({
            items: [],
            summary: {
              totalAnalyzed: 0,
              sentiments: {
                positive: 0,
                neutral: 0,
                negative: 0,
              },
              topCategories: [],
              topKeywords: [],
            },
          });
        }

        const items = itemsRaw.map((row) => ({
          id: row.id,
          message: row.message,
          rating: row.rating,
          created_at: row.created_at,
          sentiment: row.feedback_analysis.sentiment,
          categories: (row.feedback_analysis.categories ?? []) as string[],
          keywords: (row.feedback_analysis.keywords ?? []) as string[],
        }));

        // Agregações em memória
        const sentiments = {
          positive: 0,
          neutral: 0,
          negative: 0,
        };

        const categoryCounts: Record<string, number> = {};
        const keywordCounts: Record<string, number> = {};

        for (const item of items) {
          sentiments[item.sentiment]++;

          for (const category of item.categories) {
            const key = category.trim().toLowerCase();
            if (!key) continue;
            categoryCounts[key] = (categoryCounts[key] ?? 0) + 1;
          }

          for (const keyword of item.keywords) {
            const key = keyword.trim().toLowerCase();
            if (!key) continue;
            keywordCounts[key] = (keywordCounts[key] ?? 0) + 1;
          }
        }

        const topCategories = Object.entries(categoryCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        const topKeywords = Object.entries(keywordCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        return res.json({
          items,
          summary: {
            totalAnalyzed: items.length,
            sentiments,
            topCategories,
            topKeywords,
          },
        });
      } catch (error) {
        console.error('Erro ao buscar análises de feedbacks (IA):', error);
        return res.status(500).json({ error: 'internal_server_error' });
      }
    },
  );
}
