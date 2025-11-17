import { GoogleGenAI } from '@google/genai';
import { createSupabaseServerClient } from '../supabase.js';

export type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export type Sentiment = 'positive' | 'negative' | 'neutral';

export type FeedbackForAnalysis = {
  id: string;
  message: string;
  rating: number | null;
  created_at: string | null;
};

export type IaFeedbackAnalysisItem = {
  feedback_id: string;
  sentiment: Sentiment;
  categories: string[];
  keywords: string[];
};

export type IaGlobalInsights = {
  summary?: string;
  recommendations?: string[];
};

export type IaStudioResult = {
  analyzedCount: number;
  feedbacksAnalyzed: {
    id: string;
    feedback_id: string;
    sentiment: Sentiment;
    categories: string[];
    keywords: string[];
  }[];
  globalInsights: IaGlobalInsights | null;
};

export type IaStudioOptions = {
  /**
   * Quantidade máxima de feedbacks a serem enviados para a IA.
   * Default: 50, Máximo: 100.
   */
  limit?: number;
};

export class IaStudioServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}

function extractJsonFromText(raw: string): string {
  let text = raw.trim();

  // Remove cercas de código ```json ... ``` ou ``` ... ``` se existirem
  if (text.startsWith('```')) {
    const firstLineEnd = text.indexOf('\n');
    if (firstLineEnd !== -1) {
      // Ignora a linha inicial ``` ou ```json
      text = text.slice(firstLineEnd + 1);
      const lastFenceIndex = text.lastIndexOf('```');
      if (lastFenceIndex !== -1) {
        text = text.slice(0, lastFenceIndex);
      }
      text = text.trim();
    }
  }

  // Se ainda tiver texto extra, tenta pegar apenas o primeiro bloco JSON
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }

  return text;
}

function buildIaPrompt(params: {
  enterpriseName: string | null;
  companyObjective: string | null;
  analyticsGoal: string | null;
  businessSummary: string | null;
  mainProductsOrServices: string[] | null;
  feedbacks: FeedbackForAnalysis[];
}): string {
  const {
    enterpriseName,
    companyObjective,
    analyticsGoal,
    businessSummary,
    mainProductsOrServices,
    feedbacks,
  } = params;

  const header = `Você é uma IA especialista em análise de feedbacks de clientes para empresas.
Seu objetivo é:
- Entender o contexto e os objetivos da empresa.
- Analisar cada feedback individualmente.
- Classificar o sentimento de cada feedback (positive, neutral, negative).
- Categorizar o tema principal do feedback em poucas categorias de negócio.
- Extrair palavras-chave importantes do texto.
- Gerar insights acionáveis para ajudar a empresa a melhorar.

Regras IMPORTANTES:
- Responda SEMPRE em JSON válido.
- Não inclua comentários, texto fora do JSON ou explicações adicionais.
- Use apenas os valores 'positive', 'neutral' ou 'negative' em "sentiment".
- Em "categories" e "keywords", use arrays de strings curtas (ex.: ["atendimento", "preço"]).`;

  const enterpriseContext = {
    enterprise_name: enterpriseName,
    company_objective: companyObjective,
    analytics_goal: analyticsGoal,
    business_summary: businessSummary,
    main_products_or_services: mainProductsOrServices,
  };

  const payload = {
    enterprise: enterpriseContext,
    feedbacks: feedbacks,
  };

  const expectedSchemaExample: {
    feedbacks: IaFeedbackAnalysisItem[];
    global_insights: IaGlobalInsights;
  } = {
    feedbacks: [
      {
        feedback_id: 'uuid-do-feedback',
        sentiment: 'positive',
        categories: ['atendimento', 'experiência'],
        keywords: ['agilidade', 'cordialidade'],
      },
    ],
    global_insights: {
      summary:
        'Resumo geral dos principais padrões encontrados nos feedbacks, em poucas frases.',
      recommendations: [
        'Sugestão objetiva 1 para melhorar a experiência.',
        'Sugestão objetiva 2 para melhorar processos, produto ou atendimento.',
      ],
    },
  };

  return [
    header,
    '',
    'Estrutura exata de resposta (NÃO altere as chaves):',
    JSON.stringify(expectedSchemaExample, null, 2),
    '',
    'Dados de entrada (em JSON):',
    JSON.stringify(payload),
  ].join('\n');
}

export async function analyzeFeedbacksForEnterprise(params: {
  supabase: SupabaseServerClient;
  userId: string;
  options?: IaStudioOptions;
}): Promise<IaStudioResult> {
  const { supabase, userId, options } = params;

  // 1) Descobrir a empresa do usuário autenticado
  const { data: enterpriseRow, error: enterpriseError } = await supabase
    .from('enterprise')
    .select('id')
    .eq('auth_user_id', userId)
    .single();

  if (enterpriseError || !enterpriseRow) {
    throw new IaStudioServiceError(
      'Enterprise not found',
      404,
      'enterprise_not_found',
    );
  }

  const enterpriseId = enterpriseRow.id as string;

  // 2) Buscar dados de contexto da empresa (collecting_data_enterprise)
  const { data: collecting, error: collectingError } = await supabase
    .from('collecting_data_enterprise')
    .select(
      'company_objective, analytics_goal, business_summary, main_products_or_services',
    )
    .eq('enterprise_id', enterpriseRow.id)
    .maybeSingle();

  if (collectingError) {
    throw new IaStudioServiceError(
      'Failed to fetch collecting data',
      500,
      'failed_to_fetch_collecting_data',
    );
  }

  // 3) Buscar nome da empresa a partir dos metadados do usuário (raw_user_meta_data.full_name)
  const { data: authData } = await supabase.auth.getUser();
  const enterpriseName =
    (authData.user?.user_metadata as { full_name?: string } | null)
      ?.full_name ?? null;

  // 4) Buscar feedbacks da empresa (limitado para evitar prompts gigantes)
  const limit =
    typeof options?.limit === 'number' && options.limit > 0
      ? Math.min(options.limit, 100)
      : 50;

  const { data: feedbacks, error: feedbackError } = await supabase
    .from('feedback')
    .select('id, message, rating, created_at')
    .eq('enterprise_id', enterpriseId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (feedbackError) {
    throw new IaStudioServiceError(
      'Failed to fetch feedbacks for IA',
      500,
      'failed_to_fetch_feedbacks_for_ia',
    );
  }

  const feedbacksForAnalysis: FeedbackForAnalysis[] = (feedbacks ?? []).map(
    (f) => ({
      id: f.id as string,
      message: f.message as string,
      rating: (f.rating as number | null) ?? null,
      created_at: (f.created_at as string | null) ?? null,
    }),
  );

  if (feedbacksForAnalysis.length === 0) {
    return {
      analyzedCount: 0,
      feedbacksAnalyzed: [],
      globalInsights: null,
    };
  }

  // 5) Evitar reprocessar feedbacks já analisados buscando os IDs já presentes em feedback_analysis
  const { data: existingAnalysis, error: existingAnalysisError } = await supabase
    .from('feedback_analysis')
    .select('feedback_id')
    .in(
      'feedback_id',
      feedbacksForAnalysis.map((f) => f.id),
    );

  if (existingAnalysisError) {
    throw new IaStudioServiceError(
      'Failed to fetch existing analysis',
      500,
      'failed_to_fetch_existing_analysis',
    );
  }

  const alreadyAnalyzedIds = new Set(
    (existingAnalysis ?? []).map((row) => row.feedback_id as string),
  );

  const feedbacksToAnalyze = feedbacksForAnalysis.filter(
    (f) => !alreadyAnalyzedIds.has(f.id),
  );

  if (feedbacksToAnalyze.length === 0) {
    return {
      analyzedCount: 0,
      feedbacksAnalyzed: [],
      globalInsights: null,
    };
  }

  // 6) Montar prompt para o Gemini com contexto da empresa + feedbacks
  const prompt = buildIaPrompt({
    enterpriseName,
    companyObjective: collecting?.company_objective ?? null,
    analyticsGoal: collecting?.analytics_goal ?? null,
    businessSummary: collecting?.business_summary ?? null,
    mainProductsOrServices: collecting?.main_products_or_services ?? null,
    feedbacks: feedbacksToAnalyze,
  });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new IaStudioServiceError(
      'Missing Gemini API key',
      500,
      'missing_gemini_api_key',
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const aiResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  type AiResponseShape = {
    text?: string | (() => string);
  };

  const maybeText = (aiResponse as AiResponseShape).text;
  const rawText =
    (typeof maybeText === 'function' ? maybeText() : maybeText) ?? '';

  let parsed:
    | {
        feedbacks?: IaFeedbackAnalysisItem[];
        global_insights?: IaGlobalInsights;
      }
    | null = null;

  try {
    const jsonString = extractJsonFromText(rawText);
    parsed = JSON.parse(jsonString) as {
      feedbacks?: IaFeedbackAnalysisItem[];
      global_insights?: IaGlobalInsights;
    };
  } catch {
    // Log detalhado fica por conta de quem chama
    throw new IaStudioServiceError(
      'Invalid AI response JSON',
      502,
      'invalid_ai_response',
    );
  }

  const items = Array.isArray(parsed?.feedbacks) ? parsed!.feedbacks : [];

  const validSentiments: Sentiment[] = ['positive', 'negative', 'neutral'];
  const validSentimentsSet = new Set(validSentiments);

  const rowsToInsert = items
    .filter((item) => {
      return (
        typeof item.feedback_id === 'string' &&
        validSentimentsSet.has(item.sentiment) &&
        feedbacksToAnalyze.some((f) => f.id === item.feedback_id)
      );
    })
    .map((item) => ({
      feedback_id: item.feedback_id,
      sentiment: item.sentiment,
      categories: Array.isArray(item.categories)
        ? item.categories
        : ([] as string[]),
      keywords: Array.isArray(item.keywords)
        ? item.keywords
        : ([] as string[]),
    }));

  if (rowsToInsert.length === 0) {
    // IA respondeu sem itens válidos; não é erro fatal, apenas não há novos dados para salvar
    return {
      analyzedCount: 0,
      feedbacksAnalyzed: [],
      globalInsights: parsed?.global_insights ?? null,
    };
  }

  const { data: inserted, error: insertError } = await supabase
    .from('feedback_analysis')
    .insert(rowsToInsert)
    .select('id, feedback_id, sentiment, categories, keywords');

  if (insertError) {
    throw new IaStudioServiceError(
      'Failed to save feedback analysis',
      500,
      'failed_to_save_feedback_analysis',
    );
  }

  // 7) Persistir relatório global de insights (summary + recommendations) por empresa
  if (parsed?.global_insights) {
    const summary = parsed.global_insights.summary ?? null;
    const recommendations = parsed.global_insights.recommendations ?? null;

    try {
      await supabase
        .from('feedback_insights_report')
        .upsert(
          {
            enterprise_id: enterpriseId,
            summary,
            recommendations,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'enterprise_id' },
        );
    } catch {
      // Não deve quebrar o fluxo principal se o relatório falhar
      console.error('Falha ao salvar feedback_insights_report');
    }
  }

  return {
    analyzedCount: rowsToInsert.length,
    feedbacksAnalyzed:
      inserted?.map((row) => ({
        id: row.id as string,
        feedback_id: row.feedback_id as string,
        sentiment: row.sentiment as Sentiment,
        categories: (row.categories ?? []) as string[],
        keywords: (row.keywords ?? []) as string[],
      })) ?? [],
    globalInsights: parsed?.global_insights ?? null,
  };
}


