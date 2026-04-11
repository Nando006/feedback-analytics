import type { IaAnalyzeScopeType } from 'lib/interfaces/contracts/ia-analyze.contract';

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
 * Indicadores agregados para visão geral dos feedbacks.
 * Usado em: src/services/serviceFeedbacks.ts, src/routes/load/loadFeedbackStats.ts e components/user/pages/feedbacks/ui.types.ts.
 */
export interface FeedbackStats {
  totalFeedbacks: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  sentimentBreakdown: SentimentBreakdown;
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
}

/**
 * Termo mais frequente em categorias ou palavras-chave.
 * Usado em: lib/interfaces/domain/feedback.domain.ts (composição de FeedbackAnalysisSummary).
 */
export interface TopTerm {
  name: string;
  count: number;
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
