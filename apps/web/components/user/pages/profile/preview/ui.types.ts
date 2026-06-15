import type { CompanyFeedbackQuestionInput } from 'lib/interfaces/entities/enterprise.entity';
import type { QrcodeScopeType } from 'lib/interfaces/contracts/qrcode/scope.contract';

/**
 * Props do painel de prévia do formulário de feedback (reusa o formulário público real).
 * Usado em: components/user/pages/profile/preview/feedbackFormPreview.tsx.
 */
export interface FeedbackFormPreviewProps {
  /** Perguntas em edição (mesma forma serve para COMPANY e por item de catálogo). */
  questions: CompanyFeedbackQuestionInput[];
  scopeType: QrcodeScopeType;
  catalogItemId?: string | null;
  /** true (catálogo): visibilidade deriva do texto; false (COMPANY): respeita o toggle is_active. */
  activeFromText?: boolean;
  idPrefix?: string;
}
