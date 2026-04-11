export type FeedbackScopeType =
  | 'COMPANY'
  | 'PRODUCT'
  | 'SERVICE'
  | 'DEPARTMENT';

export type PromptFeedbackDynamicAnswer = {
  question_id: string;
  question_text_snapshot: string;
  answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA';
  answer_score: number;
};

export type PromptFeedbackDynamicSubanswer = {
  subquestion_id: string;
  subquestion_text_snapshot: string;
  answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA';
  answer_score: number;
};

export type PromptFeedbackInput = {
  id: string;
  message: string;
  rating: number | null;
  created_at: string | null;
  scope_type: FeedbackScopeType;
  collection_point: {
    id: string | null;
    name: string | null;
    type: string | null;
    identifier: string | null;
  } | null;
  catalog_item: {
    id: string;
    name: string;
    kind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';
    description: string | null;
  } | null;
  dynamic_answers: PromptFeedbackDynamicAnswer[];
  dynamic_subanswers: PromptFeedbackDynamicSubanswer[];
};

export type PromptEnterpriseContext = {
  enterprise_name: string | null;
  company_objective: string | null;
  analytics_goal: string | null;
  business_summary: string | null;
  main_products_or_services: string[] | null;
};

export type PromptExpectedFeedbackItem = {
  feedback_id: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  categories: string[];
  keywords: string[];
};

export type PromptExpectedGlobalInsights = {
  summary?: string;
  recommendations?: string[];
};

function getScopeInstructions(scopeType: FeedbackScopeType) {
  const instructionsByScope: Record<FeedbackScopeType, string[]> = {
    COMPANY: [
      'Contexto: feedbacks gerais da empresa (visão ampla da experiência).',
      'Priorize categorias como atendimento, comunicação, preço, ambiente, experiência geral e confiança.',
      'Considere respostas dinâmicas apenas como sinal auxiliar de polaridade, sem copiar rótulos para categorias/keywords.',
    ],
    PRODUCT: [
      'Contexto: feedbacks de produto específico.',
      'Priorize categorias como qualidade, durabilidade, custo-benefício, funcionalidades e embalagem.',
      'Use o nome/descrição do produto e respostas dinâmicas apenas para enriquecer contexto da análise textual.',
    ],
    SERVICE: [
      'Contexto: feedbacks de serviço específico.',
      'Priorize categorias como tempo de resposta, eficiência, cordialidade, clareza e resolução de problemas.',
      'Considere respostas dinâmicas apenas para apoiar inferências do texto, sem virar palavras-chave literais.',
    ],
    DEPARTMENT: [
      'Contexto: feedbacks de departamento/setor específico.',
      'Priorize categorias como processo interno, comunicação da equipe, agilidade e qualidade da interação.',
      'Use respostas dinâmicas para apoiar recomendações práticas, mas extraia termos prioritariamente da descrição.',
    ],
  };

  return instructionsByScope[scopeType];
}

export function buildIaPromptByScope(params: {
  scopeType: FeedbackScopeType;
  enterpriseContext: PromptEnterpriseContext;
  feedbacks: PromptFeedbackInput[];
}): string {
  const { scopeType, enterpriseContext, feedbacks } = params;

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
- Em "categories" e "keywords", use arrays de strings curtas (ex.: ["atendimento", "preço"]).
- A fonte principal para categories/keywords é EXCLUSIVAMENTE o campo "message" do feedback.
- Campos estruturados (rating, dynamic_answers, dynamic_subanswers, catalog_item) são contexto auxiliar e NÃO podem ser copiados literalmente.
- NÃO use termos como "pessimo", "ruim", "mediana", "boa" ou "otima" como keywords/categorias.
- NÃO copie texto das perguntas ou subperguntas dinâmicas como keywords/categorias.
- Se o texto for curto, prefira poucos termos relevantes e evidentes no próprio message.`;

  const scopeInstructions = getScopeInstructions(scopeType);

  const expectedSchemaExample: {
    feedbacks: PromptExpectedFeedbackItem[];
    global_insights: PromptExpectedGlobalInsights;
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

  const payload = {
    analysis_scope: scopeType,
    enterprise: enterpriseContext,
    feedbacks: feedbacks.map((feedback) => ({
      id: feedback.id,
      created_at: feedback.created_at,
      scope_type: feedback.scope_type,
      message_primary: feedback.message,
      context_signals: {
        rating: feedback.rating,
        dynamic_answers: feedback.dynamic_answers,
        dynamic_subanswers: feedback.dynamic_subanswers,
        collection_point: feedback.collection_point,
        catalog_item: feedback.catalog_item,
      },
    })),
  };

  return [
    header,
    '',
    `Escopo atual da análise: ${scopeType}`,
    ...scopeInstructions.map((line) => `- ${line}`),
    '',
    'Estrutura exata de resposta (NÃO altere as chaves):',
    JSON.stringify(expectedSchemaExample, null, 2),
    '',
    'Dados de entrada (em JSON):',
    JSON.stringify(payload),
  ].join('\n');
}
