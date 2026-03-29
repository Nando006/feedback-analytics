import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router-dom';
import { useToast } from 'components/public/forms/messages/useToast';
import type {
  CustomerData,
  FeedbackAnswerValue,
  FeedbackData,
} from 'lib/interfaces/contracts/qrcode.contract';
import {
  REQUIRED_QUESTION_COUNT,
  filterAnswersForQuestions,
  filterSubanswersForQuestions,
  hasAllRequiredAnswers,
  hasAllRequiredSubanswers,
  orderAnswersByQuestions,
  orderSubanswersByQuestions,
} from 'lib/utils/publicQrFeedbackForm';
import type {
  QrCodeFeedbackControllerParams,
  QrCodeFeedbackControllerResult,
  QrcodeEnterpriseActionData,
} from './ui.types';

export function useQrCodeFeedbackController({
  enterpriseId,
  collectionPointId,
  catalogItemId,
  initialError,
  questions,
}: QrCodeFeedbackControllerParams): QrCodeFeedbackControllerResult {
  const toast = useToast();
  const fetcher = useFetcher<QrcodeEnterpriseActionData>();

  const [formData, setFormData] = useState<FeedbackData>({
    message: '',
    rating: 0,
    answers: [],
    subanswers: [],
    enterprise_id: enterpriseId,
    collection_point_id: collectionPointId || undefined,
    catalog_item_id: catalogItemId || undefined,
  });
  const [customerData, setCustomerData] = useState<CustomerData>({});
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(initialError);
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false);

  const isSubmitting = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return;

    if (fetcher.data.ok) {
      toast.success('Obrigado pelo feedback!', 'Sua opinião é muito importante');
      setTimeout(() => {
        setIsSubmitted(true);
      });
      return;
    }

    if (fetcher.data.alreadySubmitted) {
      setHasAlreadySubmitted(true);
      return;
    }

    if (fetcher.data.error) {
      toast.error('Erro ao enviar feedback', fetcher.data.error);
      setError(fetcher.data.error);
    }
  }, [fetcher.state, fetcher.data, toast]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      answers: filterAnswersForQuestions(prev.answers, questions),
      subanswers: filterSubanswersForQuestions(prev.subanswers, questions),
    }));
  }, [questions]);

  const handleFormDataChange = (data: Partial<FeedbackData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleCustomerDataChange = (
    field: keyof CustomerData,
    value: string | undefined,
  ) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAnswerChange = (
    questionId: string,
    answerValue: FeedbackAnswerValue,
  ) => {
    setFormData((prev) => {
      const answersWithoutCurrentQuestion = prev.answers.filter(
        (answer) => answer.question_id !== questionId,
      );

      return {
        ...prev,
        answers: [
          ...answersWithoutCurrentQuestion,
          { question_id: questionId, answer_value: answerValue },
        ],
      };
    });
  };

  const handleSubanswerChange = (
    subquestionId: string,
    answerValue: FeedbackAnswerValue,
  ) => {
    setFormData((prev) => {
      const subanswersWithoutCurrentSubquestion = prev.subanswers.filter(
        (answer) => answer.subquestion_id !== subquestionId,
      );

      return {
        ...prev,
        subanswers: [
          ...subanswersWithoutCurrentSubquestion,
          { subquestion_id: subquestionId, answer_value: answerValue },
        ],
      };
    });
  };

  const handleToggleOptionalFields = () => {
    setShowOptionalFields(!showOptionalFields);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.enterprise_id) {
      setError('ID da empresa não encontrado. Verifique o QR Code.');
      return;
    }

    if (formData.rating === 0) {
      setError('Por favor, selecione uma avaliação.');
      return;
    }

    if (!formData.message.trim()) {
      setError('Por favor, escreva seu feedback.');
      return;
    }

    if (questions.length !== REQUIRED_QUESTION_COUNT) {
      setError('Perguntas de feedback ainda não configuradas para este QR Code.');
      return;
    }

    if (!hasAllRequiredAnswers(formData.answers, questions)) {
      setError('Responda as 3 perguntas antes de enviar.');
      return;
    }

    if (!hasAllRequiredSubanswers(formData.subanswers, questions)) {
      setError('Responda todas as subperguntas antes de enviar.');
      return;
    }

    setError('');

    const orderedAnswers = orderAnswersByQuestions(formData.answers, questions);
    const orderedSubanswers = orderSubanswersByQuestions(
      formData.subanswers,
      questions,
    );

    fetcher.submit(
      {
        enterprise_id: formData.enterprise_id,
        collection_point_id: formData.collection_point_id ?? '',
        catalog_item_id: formData.catalog_item_id ?? '',
        message: formData.message.trim(),
        rating: String(formData.rating),
        answers: JSON.stringify(orderedAnswers),
        subanswers: JSON.stringify(orderedSubanswers),
        customer_name: customerData.customer_name ?? '',
        customer_email: customerData.customer_email ?? '',
        customer_gender: customerData.customer_gender ?? '',
      },
      { method: 'post' },
    );
  };

  return {
    formData,
    customerData,
    showOptionalFields,
    isSubmitted,
    error,
    hasAlreadySubmitted,
    isSubmitting,
    handleFormDataChange,
    handleCustomerDataChange,
    handleAnswerChange,
    handleSubanswerChange,
    handleToggleOptionalFields,
    handleSubmit,
  };
}
