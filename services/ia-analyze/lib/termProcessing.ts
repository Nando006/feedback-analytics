import { normalizeForComparison } from './normalizeForComparison.js';
import type { IaAnalyzeFeedbackInput } from '../../../shared/interfaces/contracts/ia-analyze/input.contract.js';
import type { SanitizeTermListParams } from '../types/termProcessing.types.js';

export type { SanitizeTermListParams };

/**
 * Rótulos genéricos de respostas estruturadas.
 *
 * Palavras que representam avaliações padrão (ex: "boa", "ruim", "ótima")
 * e que não devem ser consideradas como categorias relevantes.
 * Usadas para filtrar termos genéricos durante a análise.
 */
export const STRUCTURED_ANSWER_LABELS = new Set<string>([
  'pessimo',
  'ruim',
  'mediana',
  'boa',
  'otima',
]);

/**
 * Lista de stopwords em português.
 *
 * Palavras muito comuns e genéricas que não agregam valor na análise de categorias,
 * como artigos, preposições e pronomes. São ignoradas em buscas e comparações.
 */
const PORTUGUESE_STOPWORDS = new Set<string>([
  'a', 'ao', 'aos', 'as', 'com', 'da', 'das', 'de', 'do', 'dos',
  'e', 'em', 'na', 'nas', 'no', 'nos', 'o', 'os', 'para', 'por',
  'que', 'sem', 'um', 'uma',
]);

/**
 * Quebra um texto em palavras relevantes para análise de categorias.
 *
 * - Normaliza o texto (remove acentos, caixa, etc.)
 * - Separa em palavras
 * - Remove espaços extras
 * - Descarta palavras com menos de 4 letras, stopwords em português e rótulos genéricos
 *
 * Retorna apenas as palavras realmente importantes para análise de similaridade ou presença na mensagem.
 */
export function tokenizeRelevantWords(value: string): string[] {
  return normalizeForComparison(value)
    .split(' ')
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length >= 4 &&
        !PORTUGUESE_STOPWORDS.has(token) &&
        !STRUCTURED_ANSWER_LABELS.has(token),
    );
}

/**
 * Verifica se um termo realmente tem relação com a mensagem analisada.
 *
 * - Se o termo está contido na mensagem normalizada, retorna true.
 * - Se não, divide o termo e a mensagem em palavras relevantes (ignorando palavras pequenas e genéricas).
 * - Retorna true se pelo menos uma palavra relevante do termo também aparece na mensagem.
 * - Caso contrário, retorna false.
 *
 * Serve para garantir que só categorias que realmente aparecem ou têm relação com o texto do feedback sejam consideradas válidas.
 */
export function isGroundedInMessage(termNormalized: string, messageNormalized: string): boolean {
  if (!termNormalized || !messageNormalized) return false;
  if (messageNormalized.includes(termNormalized)) return true;

  const termTokens = tokenizeRelevantWords(termNormalized);
  if (termTokens.length === 0) return false;

  const messageTokens = new Set(tokenizeRelevantWords(messageNormalized));
  return termTokens.some((token) => messageTokens.has(token));
}

/**
 * Recebe terms, messageNormalized, forbiddenTerms e maxCount e retorna até (maxCount) termos limpos e relevantes
 * 
 * Devolve um array de termos normalizados, únicos e que realmente tem relação com a mensagem
 * 
 * Como funciona:
 * 
 * Para cada termo: converte/trim, normaliza com normalizeForComparison, ignora vazios, descarta se está em forbiddenTerms, verifica se o termo está "ancorado" na mensagem (isGroundedInMessage), evita duplicadas, adiciona ao resultado até atingir maxCount.
 */
export function sanitizeTermList(params: SanitizeTermListParams): string[] {
  const { terms, messageNormalized, forbiddenTerms, maxCount } = params;
  const result: string[] = [];
  const seen = new Set<string>();

  for (const value of terms) {
    const rawTerm = String(value ?? '').trim();
    if (!rawTerm) continue;

    const normalizedTerm = normalizeForComparison(rawTerm);
    if (!normalizedTerm) continue;
    if (forbiddenTerms.has(normalizedTerm)) continue;
    if (!isGroundedInMessage(normalizedTerm, messageNormalized)) continue;
    if (seen.has(normalizedTerm)) continue;

    seen.add(normalizedTerm);
    result.push(normalizedTerm);

    if (result.length >= maxCount) break;
  }

  return result;
}

/**
 * Gera uma lista (Set) de termos proibidos, ou seja, palavras/frases que não podem ser usadas como categorias. Assim, qualquer termo que já apareceu como resposta ou pergunta, ou que seja um rótulo genérico, será bloqueado de virar categoria. Isso evita categorias repetidas, genéricas ou irrelevantes.
 * 
 * Entrada: IaAnalyzeFeedbackInput.
 * 
 * Saída: Set<string> com termos proíbidos
 * 
 * Essa função ela começa criando forbidden (Palavras ou frases que não devem ser consideradas como catégorias válidas). Já preenchido com STRUCTURED_ANSWER_LABELS (ex: "pessimo", "ruim"...).
 * 
 * Percorre feedback.dynamic_answers: normaliza com normalizeFormComparison e adiciona ao set tanto answer.answer_value quanto question_text_snapshot quando não vazios
 * 
 * Faz o mesmo para feedback.dynamic_subanswers (adiciona answer_value e subquestion_text_snapshot).
 * 
 * Retorna o Set final — usado para impedir que valores de respostas/perguntas ou rótulos estruturados virem categorias (funciona como lista de stopwords).
 * 
 * Observação: a normalização garante comparações estáveis (remover/normalizar maiúsculas, acentos, espaços, etc.).
 * 
 */
export function buildForbiddenTerms(feedback: IaAnalyzeFeedbackInput): Set<string> {
  const forbidden = new Set<string>(STRUCTURED_ANSWER_LABELS);

  feedback.dynamic_answers.forEach((answer) => {
    const value = normalizeForComparison(answer.answer_value);
    if (value) forbidden.add(value);

    const question = normalizeForComparison(answer.question_text_snapshot);
    if (question) forbidden.add(question);
  });

  feedback.dynamic_subanswers.forEach((answer) => {
    const value = normalizeForComparison(answer.answer_value);
    if (value) forbidden.add(value);

    const subquestion = normalizeForComparison(answer.subquestion_text_snapshot);
    if (subquestion) forbidden.add(subquestion);
  });

  return forbidden;
}
