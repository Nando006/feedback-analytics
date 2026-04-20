import type { IaAnalyzeExecutionMode } from '../../types/iaAnalyze.types.js';

/**
 * Retorna o modo de execução da análise IA ('local' ou 'remote').
 *
 * Lê a variável de ambiente IA_ANALYZE_EXECUTION_MODE e normaliza o valor.
 * Se não informado ou inválido, assume 'local' por padrão.
 * Útil para alternar entre execução local e chamada remota sem mudar código.
 */
export function getExecutionMode(): IaAnalyzeExecutionMode {
  const rawMode = String(process.env.IA_ANALYZE_EXECUTION_MODE ?? 'local')
    .trim()
    .toLowerCase();

  return rawMode === 'remote' ? 'remote' : 'local';
}