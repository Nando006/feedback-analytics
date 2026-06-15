import type { CompanyFeedbackQuestionInput } from 'lib/interfaces/entities/enterprise.entity';
import type {
  FeedbackQuestionPublic,
  FeedbackSubquestionPublic,
} from 'lib/interfaces/contracts/qrcode/question.contract';
import type { QrcodeScopeType } from 'lib/interfaces/contracts/qrcode/scope.contract';

export type MapEditorQuestionsOptions = {
  /** Escopo do formulário previsto (COMPANY para feedback geral; PRODUCT/SERVICE/DEPARTMENT por item). */
  scopeType: QrcodeScopeType;
  /** Item de catálogo do escopo (null no COMPANY). */
  catalogItemId?: string | null;
  /** Prefixo para os ids sintéticos das perguntas/subperguntas do preview. */
  idPrefix?: string;
  /**
   * Como decidir se uma pergunta/subpergunta aparece no preview:
   * - `true` (catálogo): deriva do texto (não-vazio = aparece) — espelha a regra do save por item,
   *   onde `is_active` é derivado de ter texto.
   * - `false` (COMPANY): respeita o toggle `is_active` (e ainda exige texto não-vazio).
   */
  activeFromText: boolean;
};

/**
 * Converte o estado do editor de perguntas (mesma forma para COMPANY e catálogo) no contrato
 * público que o `FormQRCodeFeedback` consome, para alimentar o preview ao vivo.
 *
 * Mostra apenas o que o cliente realmente veria: descarta perguntas/subperguntas de texto vazio
 * (para não vazar placeholders) e, no COMPANY, as marcadas como inativas. No catálogo, a
 * visibilidade segue o texto (regra usada no save por item).
 */
export function mapEditorQuestionsToPublic(
  questions: CompanyFeedbackQuestionInput[],
  options: MapEditorQuestionsOptions,
): FeedbackQuestionPublic[] {
  const {
    scopeType,
    catalogItemId = null,
    idPrefix = 'preview',
    activeFromText,
  } = options;

  const result: FeedbackQuestionPublic[] = [];

  for (const question of questions) {
    const text = String(question.question_text ?? '').trim();
    if (text.length === 0) continue;
    if (!activeFromText && question.is_active === false) continue;

    const questionId = `${idPrefix}-q${question.question_order}`;

    const subquestions: FeedbackSubquestionPublic[] = [];
    for (const sub of question.subquestions ?? []) {
      const subText = String(sub.subquestion_text ?? '').trim();
      if (subText.length === 0) continue;

      subquestions.push({
        id: `${questionId}-s${sub.subquestion_order}`,
        question_id: questionId,
        subquestion_order: sub.subquestion_order,
        subquestion_text: subText,
        // O FieldDynamicQuestions filtra subperguntas por is_active em runtime.
        is_active: activeFromText ? true : sub.is_active !== false,
      });
    }

    result.push({
      id: questionId,
      scope_type: scopeType,
      catalog_item_id: catalogItemId,
      question_order: question.question_order,
      question_text: text,
      subquestions,
    });
  }

  return result;
}
