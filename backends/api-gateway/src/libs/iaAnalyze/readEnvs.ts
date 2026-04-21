import type { IaAnalyzeExecutionMode } from '../../types/iaAnalyze.types.js';
import { normalizeBaseUrl } from './normalize.js';

/**
 * Timeout padrão (em milissegundos) para requisições ao serviço IA remoto.
 *
 * Usado quando a variável de ambiente IA_ANALYZE_REMOTE_TIMEOUT_MS não está definida ou é inválida.
 */
const DEFAULT_REMOTE_TIMEOUT_MS = 20_000;

/**
 * URL padrão usada como alias para o serviço IA remoto em ambientes de preview (deploy temporário).
 *
 * Só é utilizada se a variável de ambiente IA_ANALYZE_REMOTE_PREVIEW_ALIAS_URL não estiver definida
 * e o ambiente Vercel for 'preview'.
 */
const DEFAULT_PREVIEW_IA_ANALYZE_ALIAS_URL =
  'https://feedback-analytics-service-ia-analysis-homolog.vercel.app';

/**
 * Lê o modo de execução da análise IA a partir das variáveis de ambiente.
 *
 * - Busca IA_ANALYZE_EXECUTION_MODE ("local" ou "remote").
 * - Se não definido ou valor inválido, retorna "local" por padrão.
 *
 * Útil para alternar entre análise local e remota sem mudar código.
 */
export function readExecutionMode(): IaAnalyzeExecutionMode {
  const rawMode = String(process.env.IA_ANALYZE_EXECUTION_MODE ?? 'local')
    .trim()
    .toLowerCase();

  return rawMode === 'remote' ? 'remote' : 'local';
}

/**
 * Lê e normaliza a URL base do serviço IA remoto a partir das variáveis de ambiente.
 *
 * - Busca IA_ANALYZE_REMOTE_URL.
 * - Usa normalizeBaseUrl para garantir formato correto.
 * - Retorna null se não definido.
 *
 * Útil para configurar dinamicamente o endpoint remoto da IA.
 */
export function readRemoteBaseUrl(): string | null {
  return normalizeBaseUrl(process.env.IA_ANALYZE_REMOTE_URL ?? '');
}

/**
 * Lê o token de autenticação para o serviço IA remoto das variáveis de ambiente.
 *
 * - Busca IA_ANALYZE_REMOTE_TOKEN.
 * - Remove espaços e retorna null se vazio.
 *
 * Útil para enviar o token correto ao consumir a API remota da IA.
 */
export function readRemoteToken(): string | null {
  const rawValue = String(process.env.IA_ANALYZE_REMOTE_TOKEN ?? '').trim();
  return rawValue.length > 0 ? rawValue : null;
}

/**
 * Lê o timeout (em ms) para requisições ao serviço IA remoto.
 *
 * - Busca IA_ANALYZE_REMOTE_TIMEOUT_MS.
 * - Se não definido ou inválido, retorna valor padrão (20_000 ms).
 *
 * Útil para evitar travamentos em chamadas remotas muito demoradas.
 */
export function readRemoteTimeoutMs(): number {
  const rawValue = String(process.env.IA_ANALYZE_REMOTE_TIMEOUT_MS ?? '').trim();
  const parsed = Number(rawValue);

  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }

  return DEFAULT_REMOTE_TIMEOUT_MS;
}

/**
 * Lê e normaliza a URL base do alias de preview do serviço IA remoto.
 *
 * - Busca IA_ANALYZE_REMOTE_PREVIEW_ALIAS_URL.
 * - Se não definido, retorna URL padrão apenas se VERCEL_ENV for 'preview'.
 * - Caso contrário, retorna null.
 *
 * Útil para ambientes de preview (deploy temporário) no Vercel.
 */
export function readPreviewAliasBaseUrl(): string | null {
  const fromEnv = normalizeBaseUrl(
    process.env.IA_ANALYZE_REMOTE_PREVIEW_ALIAS_URL ?? '',
  );

  if (fromEnv) {
    return fromEnv;
  }

  const vercelEnv = String(process.env.VERCEL_ENV ?? '')
    .trim()
    .toLowerCase();

  if (vercelEnv !== 'preview') {
    return null;
  }

  return DEFAULT_PREVIEW_IA_ANALYZE_ALIAS_URL;
}

/**
 * Lê se o fallback local está habilitado para o serviço IA remoto.
 *
 * - Busca IA_ANALYZE_REMOTE_FALLBACK_LOCAL.
 * - Se não definido, considera habilitado (true).
 * - Se valor for 'false', desabilita o fallback.
 *
 * Útil para permitir que a aplicação use IA local caso o remoto falhe.
 */
export function readFallbackEnabled(): boolean {
  const rawValue = String(process.env.IA_ANALYZE_REMOTE_FALLBACK_LOCAL ?? 'true')
    .trim()
    .toLowerCase();

  return rawValue !== 'false';
}
