import type { IaAnalyzeScopeType } from 'lib/interfaces/contracts/ia-analyze/scope.contract';

/**
 * Cliente identificado no dispositivo associado ao feedback.
 * Usado em: lib/interfaces/domain/feedback.domain.ts (composição de TrackedDevice).
 */
export interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  gender: string | null;
}

/**
 * Dispositivo rastreado utilizado para envio de feedback.
 * Usado em: lib/interfaces/domain/feedback.domain.ts (composição de Feedback).
 */
export interface TrackedDevice {
  id: string;
  device_fingerprint: string | null;
  user_agent: string | null;
  ip_address: string | null;
  feedback_count: number | null;
  is_blocked: boolean | null;
  customer_id: string | null;
  customer: Customer | null;
}

/**
 * Ponto/canal de coleta por onde o feedback foi recebido.
 * Usado em: lib/interfaces/domain/feedback.domain.ts (composição de Feedback).
 */
export interface CollectionPoint {
  id: string;
  name: string;
  type: 'QR_CODE' | 'EMAIL' | 'WHATSAPP' | 'LINK_DIRETO';
  identifier: string | null;
  catalog_item_id?: string | null;
  catalog_item_name?: string | null;
  catalog_item_kind?: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT' | null;
  catalog_items?: {
    name: string;
    kind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';
  } | null;
}

/**
 * Resposta de uma pergunta dinâmica vinculada ao feedback.
 * Usado em: componentes de listagem/detalhe de feedback e dashboard.
 */
export interface FeedbackQuestionAnswer {
  question_id: string;
  question_text_snapshot: string;
  answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA';
  answer_score: number;
}

/**
 * Entidade de feedback com vínculo de canal e dispositivo rastreado.
 * Usado em: src/services/serviceFeedbacks.ts, src/routes/load/loadFeedbacks.ts, loaderUserDashboard.ts e components/user/pages/feedbacksAll/ui.types.ts.
 */
export interface Feedback {
  id: string;
  message: string;
  rating: number;
  created_at: string;
  updated_at: string;
  collection_points: CollectionPoint;
  tracked_devices: TrackedDevice | null;
  feedback_question_answers?: FeedbackQuestionAnswer[];
}

/**
 * Metadados de paginação para listagens de feedback.
 * Usado em: src/services/serviceFeedbacks.ts e components/user/pages/feedbacks/ui.types.ts.
 */
export interface FeedbackPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Resposta paginada de feedbacks para a interface do usuário.
 * Usado em: src/services/serviceFeedbacks.ts e src/routes/load/loadFeedbacksAll.ts.
 */
export interface FeedbacksResponse {
  feedbacks: Feedback[];
  pagination: FeedbackPagination;
}

/**
 * Distribuição de quantidade de feedbacks por nota de 1 a 5.
 * Usado em: lib/interfaces/domain/feedback.domain.ts (composição de FeedbackStats).
 */
export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

/**
 * Quebra de sentimento em positivo, neutro e negativo.
 * Usado em: lib/interfaces/domain/feedback.domain.ts (composição de FeedbackStats e FeedbackAnalysisSummary).
 */
export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

/**
 * Intervalo de confiança / limites. A UNIDADE depende do campo (fração, % ou nota).
 * Usado em: métricas estatísticas de FeedbackStats / FeedbackAnalysisSummary / TopTerm.
 */
export interface Interval {
  lower: number;
  upper: number;
}

/**
 * Camada de confiança derivada do tamanho da amostra (n):
 * insufficient (<10) · low (10–29) · moderate (30–99) · good (100+).
 */
export type ConfidenceTier = 'insufficient' | 'low' | 'moderate' | 'good';

/**
 * Indicadores agregados para visão geral dos feedbacks.
 * Usado em: src/services/serviceFeedbacks.ts, src/routes/load/loadFeedbackStats.ts e components/user/pages/feedbacks/ui.types.ts.
 */
export interface FeedbackStats {
  totalFeedbacks: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  sentimentBreakdown: SentimentBreakdown;
  /** Feedbacks (no escopo) que já têm análise da IA. */
  totalAnalyzed?: number;
  /** Feedbacks (no escopo) ainda não analisados (totalFeedbacks - totalAnalyzed). */
  pendingCount?: number;
  /** Timestamp (ISO) da análise mais recente no escopo; null se nenhuma. */
  latestAnalysisAt?: string | null;
  /** Lente SATISFAÇÃO (estrelas): média de notas (1-5). */
  starMean?: number;
  /** IC t da média de notas, em unidade de nota [1,5]. */
  starMeanCI?: Interval;
  /** Net Satisfaction = %(4-5) − %(1-2) → [-100,100]. */
  netSatisfaction?: number;
  /** CSAT Top-2-Box: % de notas 4-5, com IC de Wilson (em %). */
  csat?: { pct: number; ci: Interval };
  /** Camada de confiança pela quantidade de feedbacks no escopo. */
  confidenceTier?: ConfidenceTier;
  /** Lente SENTIMENTO (IA/texto) sobre o subconjunto analisado. */
  aiSentiment?: {
    positive: number;
    neutral: number;
    negative: number;
    /** Net Sentiment Score = (pos-neg)/analisados × 100 → [-100,100]. */
    netSentimentScore: number;
    confidenceTier: ConfidenceTier;
  };
}

/**
 * Filtros disponíveis para consultas/listagens de feedback.
 * Usado em: src/routes/load/loadFeedbacks.ts e components/user/pages/feedbacks/ui.types.ts.
 */
export interface FeedbackFilters {
  page?: number;
  limit?: number;
  rating?: number;
  search?: string;
  category?: FeedbackCategory;
  item?: string;
}

/**
 * Categoria funcional para filtro de feedbacks na listagem.
 * Usado em: src/services/serviceFeedbacks.ts, src/routes/load/loadFeedbacksAll.ts e components/user/pages/feedbacks/feedbackFilters.tsx.
 */
export type FeedbackCategory =
  | 'COMPANY'
  | 'PRODUCT'
  | 'SERVICE'
  | 'DEPARTMENT';

export type FeedbackInsightScopeType = IaAnalyzeScopeType;

/**
 * Sentimento classificado para um feedback analisado.
 * Usado em: lib/interfaces/domain/feedback.domain.ts (composição de FeedbackAnalysisItem).
 */
export type FeedbackSentiment = 'positive' | 'neutral' | 'negative';

/**
 * Aspecto (ABSA) extraído do texto, com seu próprio sentimento.
 * Usado em: FeedbackAnalysisItem (composição) e telas de Insights.
 */
export interface FeedbackAspect {
  aspect: string;
  sentiment: FeedbackSentiment;
  /** Intensidade graduada do aspecto em [-1, 1] (opcional). */
  sentiment_score?: number | null;
}

/**
 * Item de feedback enriquecido com análise semântica.
 * Usado em: src/routes/load/loadFeedbackAnalysis.ts e components/user/pages/feedbacksInsightsEmotional/ui.types.ts.
 */
export interface FeedbackAnalysisItem {
  id: string;
  message: string;
  rating: number | null;
  created_at: string;
  sentiment: FeedbackSentiment;
  categories: string[];
  keywords: string[];
  /**
   * Divergência entre a nota (estrela) e o sentimento do texto (IA):
   * 'silent_detractor' = nota alta + texto negativo; 'rating_misuse' = nota
   * baixa + texto positivo; null = sem divergência.
   */
  discrepancy?: 'silent_detractor' | 'rating_misuse' | null;
  /** Sentimento por aspecto (ABSA) extraído do texto. */
  aspects?: FeedbackAspect[];
  /** Intensidade graduada do sentimento geral em [-1, 1]. */
  sentiment_score?: number | null;
  /** Confiança da classificação em [0, 1]. */
  confidence?: number | null;
}

/**
 * Termo mais frequente em categorias ou palavras-chave.
 * Usado em: lib/interfaces/domain/feedback.domain.ts (composição de FeedbackAnalysisSummary).
 */
export interface TopTerm {
  name: string;
  count: number;
  /** Proporção do termo sobre o total analisado (0..1). */
  proportion?: number;
  /** IC de Wilson da proporção (em fração 0..1). */
  ci?: Interval;
}

/**
 * Resumo consolidado da análise de feedbacks.
 * Usado em: src/routes/load/loadFeedbackAnalysis.ts e components/user/pages/feedbacksInsightsReport/ui.types.ts.
 */
export interface FeedbackAnalysisSummary {
  totalAnalyzed: number;
  sentiments: SentimentBreakdown;
  topCategories: TopTerm[];
  topKeywords: TopTerm[];
  /** Net Sentiment Score = (pos-neg)/analisados × 100 → [-100,100]. */
  netSentimentScore?: number;
  /** IC de Wilson por classe de sentimento (em fração 0..1). */
  sentimentCIs?: {
    positive: Interval;
    neutral: Interval;
    negative: Interval;
  };
  /** Camada de confiança pela quantidade de feedbacks analisados. */
  confidenceTier?: ConfidenceTier;
  /** Sentimento agregado por aspecto (ABSA), ranqueado por impacto. */
  aspectSentiments?: AspectSentiment[];
}

/**
 * Sentimento agregado de um aspecto (ABSA) no escopo.
 * Usado em: FeedbackAnalysisSummary e a seção "Aspectos que mais impactam".
 */
export interface AspectSentiment {
  aspect: string;
  positive: number;
  neutral: number;
  negative: number;
  count: number;
  /** Net Sentiment Score do aspecto → [-100,100]. */
  netSentimentScore: number;
  /** IC de Wilson da proporção positiva do aspecto (fração 0..1). */
  ci?: Interval;
}

/**
 * Resposta completa da análise com itens detalhados e resumo.
 * Usado em: src/services/serviceFeedbacks.ts e src/routes/load/loadFeedbackAnalysis.ts.
 */
export interface FeedbackAnalysisResponse {
  items: FeedbackAnalysisItem[];
  summary: FeedbackAnalysisSummary;
}

export type FeedbackAnalysisOptions = {
  sentiment?: FeedbackSentiment;
  scope_type?: FeedbackInsightScopeType;
  catalog_item_id?: string;
};

/**
 * Relatório textual de insights e recomendações gerado para feedbacks.
 * Usado em: src/routes/load/loadFeedbackInsightsReport.ts e pages/user/feedbacks/insights/feedbackInsightsReport.tsx.
 */
export interface FeedbackInsightsReport {
  summary: string | null;
  recommendations: string[];
  updatedAt: string | null;
  scopeType?: FeedbackInsightScopeType;
  catalogItemId?: string | null;
}

export type FeedbackInsightsReportOptions = {
  scope_type?: FeedbackInsightScopeType;
  catalog_item_id?: string;
};

/**
 * Filtro de escopo para as métricas do dashboard (stats).
 * COMPANY (Geral) considera apenas o QR da empresa (catalog_item_id NULL).
 */
export type FeedbackStatsOptions = {
  scope_type?: FeedbackInsightScopeType;
  catalog_item_id?: string;
};
