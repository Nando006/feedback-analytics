import { useMemo, useState } from 'react';
import FormQRCodeFeedback from 'components/public/forms/formQRCodeFeedback';
import { mapEditorQuestionsToPublic } from 'src/lib/utils/mapEditorQuestionsToPublic';
import type {
  CustomerData,
  FeedbackData,
} from 'lib/interfaces/contracts/qrcode/feedback.contract';
import type { PublicQrFeedbackFormViewModel } from 'components/public/forms/fields/fieldsQRCode/ui.types';
import type { FeedbackFormPreviewProps } from './ui.types';

/**
 * Prévia ao vivo do formulário público de feedback dentro das telas de configuração.
 *
 * Reusa o componente real `FormQRCodeFeedback` (fidelidade 100%) com um view-model SIMULADO —
 * sem `useQrCodeFeedbackController` (que acopla fetch/toast) e com `submit` neutralizado.
 * O estado local leve deixa o gestor experimentar (clicar na nota, responder) sem persistir nada.
 * Envolto em `.public-theme` para herdar as cores exatas do formulário do cliente.
 */
export default function FeedbackFormPreview({
  questions,
  scopeType,
  catalogItemId = null,
  activeFromText = false,
  idPrefix = 'preview',
}: FeedbackFormPreviewProps) {
  const publicQuestions = useMemo(
    () =>
      mapEditorQuestionsToPublic(questions, {
        scopeType,
        catalogItemId,
        activeFromText,
        idPrefix,
      }),
    [questions, scopeType, catalogItemId, activeFromText, idPrefix],
  );

  const [rating, setRating] = useState(0);
  const [answers, setAnswers] = useState<FeedbackData['answers']>([]);
  const [subanswers, setSubanswers] = useState<FeedbackData['subanswers']>([]);
  const [message, setMessage] = useState('');
  const [customerData, setCustomerData] = useState<CustomerData>({});
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const model: PublicQrFeedbackFormViewModel = {
    state: {
      formData: {
        message,
        rating,
        answers,
        subanswers,
        enterprise_id: 'preview',
      },
      questions: publicQuestions,
      customerData,
      showOptionalFields,
      error: '',
      isSubmitting: false,
    },
    actions: {
      updateFormData: (data) => {
        if (data.message !== undefined) setMessage(data.message);
        if (data.rating !== undefined) setRating(data.rating);
      },
      updateAnswer: (questionId, answerValue) =>
        setAnswers((prev) => [
          ...prev.filter((a) => a.question_id !== questionId),
          { question_id: questionId, answer_value: answerValue },
        ]),
      updateSubanswer: (subquestionId, answerValue) =>
        setSubanswers((prev) => [
          ...prev.filter((a) => a.subquestion_id !== subquestionId),
          { subquestion_id: subquestionId, answer_value: answerValue },
        ]),
      updateCustomerData: (field, value) =>
        setCustomerData((prev) => ({ ...prev, [field]: value }) as CustomerData),
      toggleOptionalFields: () => setShowOptionalFields((v) => !v),
      submit: (event) => event.preventDefault(),
    },
  };

  return (
    <div className="rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-(--text-tertiary)">
          Prévia do formulário
        </span>
        <span className="rounded-full bg-(--seventh-color) px-2.5 py-1 text-xs text-(--text-tertiary)">
          Não enviada
        </span>
      </div>
      <div className="public-theme rounded-xl bg-(--bg-primary) p-5">
        <FormQRCodeFeedback model={model} />
      </div>
    </div>
  );
}
