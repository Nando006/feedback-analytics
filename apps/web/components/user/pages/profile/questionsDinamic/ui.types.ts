import type { CompanyFeedbackQuestionInput } from "lib/interfaces/entities/enterprise.entity";
import type { QrcodeScopeType } from "lib/interfaces/contracts/qrcode/scope.contract";

/** Campo oculto extra enviado junto do formulário do editor (ex.: catalog_item_id). */
export interface QuestionsEditorHiddenField {
  name: string;
  value: string;
}

/**
 * Props do editor de perguntas compartilhado (empresa + item de catálogo).
 * Usado em: components/user/pages/profile/questionsDinamic/questionsEditor.tsx.
 */
export interface QuestionsEditorProps {
  /** Perguntas iniciais já normalizadas (idealmente 3, cada uma com 3 subperguntas). */
  initialQuestions: CompanyFeedbackQuestionInput[];
  /** Catálogo permite 1–3 perguntas (adicionar/remover); empresa é fixo em 3. */
  allowVariableQuestionCount: boolean;
  /** Empresa exige exatamente 3 perguntas válidas; catálogo torna-as opcionais. */
  requireAllThree: boolean;
  /** URL para onde o formulário é enviado (action da rota). */
  action: string;
  intent: string;
  /** Nome do campo que carrega o JSON das perguntas (ex.: company_feedback_questions, questions). */
  payloadFieldName: string;
  /** Campos ocultos adicionais (ex.: catalog_item_id no escopo de item). */
  extraHiddenFields?: QuestionsEditorHiddenField[];
  submitLabel: string;
  successTitle: string;
  successMessage: string;
  /** Escopo usado pela prévia (COMPANY ou o tipo do item de catálogo). */
  scopeType: QrcodeScopeType;
  catalogItemId?: string | null;
  /** Prefixo estável para ids sintéticos da prévia. */
  idPrefix: string;
}
