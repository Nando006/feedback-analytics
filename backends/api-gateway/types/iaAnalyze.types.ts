import type {
  IaAnalyzeFeedbackInput,
} from '../../../shared/interfaces/contracts/ia-analyze/input.contract.js';
import type {
  IaAnalyzeScopeType,
} from '../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';

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
