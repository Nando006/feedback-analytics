import type {
  IaAnalyzeFeedbackInput,
} from '../../../../shared/interfaces/contracts/ia-analyze/input.contract.js';
import type {
  IaAnalyzeScopeType,
} from '../../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';
import type {
  IaAnalyzeSentiment,
} from '../../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';

/**
 * Define o modo de execução da análise IA.
 *
 * - 'local': usa o serviço IA rodando localmente (ex: dev/teste)
 * - 'remote': usa o serviço IA remoto (ex: produção/homologação)
 *
 * Permite alternar facilmente entre ambientes sem mudar a lógica do código.
 */
export type IaAnalyzeExecutionMode = 'local' | 'remote';

/**
 * Representa um lote de feedbacks agrupados para análise IA.
 *
 * Cada batch contém feedbacks do mesmo contexto (escopo e item de catálogo),
 * permitindo que a IA processe juntos apenas dados homogêneos.
 *
 * - scopeType: tipo de contexto (ex: 'COMPANY', 'PRODUCT', etc)
 * - catalogItemId: id do item de catálogo ou null
 * - catalogItemName: nome do item de catálogo ou null
 * - feedbacks: lista de feedbacks desse contexto
 *
 * Usado para organizar e enviar os dados de forma estruturada para a IA,
 * melhorando a precisão e a clareza dos resultados.
 */
export type AnalysisBatch = {
  scopeType: IaAnalyzeScopeType;
  catalogItemId: string | null;
  catalogItemName: string | null;
  feedbacks: IaAnalyzeFeedbackInput[];
};

/**
 * Representa o resultado da análise IA para um feedback individual.
 *
 * - sentiment: sentimento detectado ('positive', 'neutral' ou 'negative')
 * - categories: lista de categorias identificadas ou null
 * - keywords: lista de palavras-chave extraídas ou null
 *
 * Usado para armazenar e trafegar o resultado da IA de cada feedback analisado.
 */
export type FeedbackAnalysis = {
  sentiment: 'positive' | 'neutral' | 'negative';
  categories: string[] | null;
  keywords: string[] | null;
};

/**
 * Representa um feedback individual junto com o resultado da análise IA.
 *
 * - id: identificador do feedback
 * - message: texto do feedback
 * - rating: nota (se houver)
 * - created_at: data de criação
 * - feedback_analysis: resultado da IA (sentimento, categorias, palavras-chave) ou null se não analisado
 *
 * Usado para trafegar e exibir feedbacks já analisados, facilitando o consumo dos resultados.
 */
export type FeedbackWithAnalysisRow = {
  id: string;
  message: string;
  rating: number | null;
  created_at: string;
  feedback_analysis: FeedbackAnalysis | null;
};

/**
 * Versão "crua" de FeedbackWithAnalysisRow, usada para parsing de dados vindos da IA.
 *
 * Permite que feedback_analysis venha como objeto, array ou null (flexível para respostas da IA).
 * Usado como etapa intermediária antes de normalizar para FeedbackWithAnalysisRowNormalized.
 */
export type FeedbackWithAnalysisRowRaw = Omit<
  FeedbackWithAnalysisRow,
  'feedback_analysis'
> & {
  feedback_analysis: FeedbackAnalysis | FeedbackAnalysis[] | null;
};

/**
 * Versão normalizada de FeedbackWithAnalysisRow, garantindo que sempre há análise presente.
 *
 * - feedback_analysis nunca é null (sempre um objeto válido)
 *
 * Usado após o parsing para garantir consistência dos dados consumidos pela aplicação.
 */
export type FeedbackWithAnalysisRowNormalized = FeedbackWithAnalysisRow & {
  feedback_analysis: FeedbackAnalysis;
};

export type CollectingDataContext = {
  company_objective?: string | null;
  analytics_goal?: string | null;
  business_summary?: string | null;
  main_products_or_services?: string[] | null;
};

export type FeedbackAnalysisInsertRow = {
  feedback_id: string;
  sentiment: IaAnalyzeSentiment;
  categories: string[];
  keywords: string[];
};

export type RawFeedbackRow = {
  id: string;
  message: string;
  rating: number | null;
  created_at: string | null;
  collection_points:
    | {
        id?: string | null;
        name?: string | null;
        type?: string | null;
        identifier?: string | null;
        catalog_item_id?: string | null;
      }
    | Array<{
        id?: string | null;
        name?: string | null;
        type?: string | null;
        identifier?: string | null;
        catalog_item_id?: string | null;
      }>
    | null;
};

export type RawCatalogItemRow = {
  id: string;
  name: string;
  kind: string;
  description: string | null;
};

export type RawFeedbackQuestionAnswerRow = {
  feedback_id: string;
  question_id: string;
  question_text_snapshot: string;
  answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA';
  answer_score: number;
};

 export type RawFeedbackSubquestionAnswerRow = {
  feedback_id: string;
  subquestion_id: string;
  subquestion_text_snapshot: string;
  answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA';
  answer_score: number;
};
