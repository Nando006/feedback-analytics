import { useEffect, useMemo, useState } from 'react';
import { useFetcher, useLoaderData } from 'react-router-dom';
import Card from 'components/public/shared/card';
import SVGImageProfile from 'components/svg/imageProfile';
import type {
  CustomerData,
  FeedbackAnswerValue,
  FeedbackData,
} from 'lib/interfaces/contracts/qrcode.contract';
import StateSentPreviousFeedback from 'components/public/qrcode/enterprise/stateSentPreviousFeedback';
import StateError from 'components/public/qrcode/enterprise/stateError';
import StateSubmitted from 'components/public/qrcode/enterprise/stateSubmitted';
import FormQRCodeFeedback from 'components/public/forms/formQRCodeFeedback';
import type { LoaderPublicQrCodeEnterprise } from 'src/routes/loaders/loaderPublicQrCodeEnterprise';
import type { QrcodeEnterpriseActionData } from './ui.types';

export default function FeedbackQRCodeEnterprise() {
  const loaderData =
    useLoaderData<Awaited<ReturnType<typeof LoaderPublicQrCodeEnterprise>>>();

  const enterpriseId = loaderData?.enterpriseId ?? '';
  const collectionPointId = loaderData?.collectionPointId ?? '';
  const catalogItemId = loaderData?.catalogItemId ?? '';
  const initialError = loaderData?.error ?? '';
  const enterpriseName = loaderData?.enterpriseName ?? '';
  const itemName = loaderData?.itemName ?? '';
  const itemKind = loaderData?.itemKind ?? null;
  const questions = useMemo(
    () => loaderData?.questions ?? [],
    [loaderData?.questions],
  );

  const itemKindLabel =
    itemKind === 'PRODUCT'
      ? 'Produto'
      : itemKind === 'SERVICE'
        ? 'Serviço'
        : itemKind === 'DEPARTMENT'
          ? 'Departamento'
          : null;

  const [formData, setFormData] = useState<FeedbackData>({
    message: '',
    rating: 0,
    answers: [],
    enterprise_id: enterpriseId,
    collection_point_id: collectionPointId || undefined,
    catalog_item_id: catalogItemId || undefined,
  });
  const [customerData, setCustomerData] = useState<CustomerData>({});
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(initialError);
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false);
  const fetcher = useFetcher<QrcodeEnterpriseActionData>();

  const isSubmitting = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return;

    if (fetcher.data.ok) {
      setIsSubmitted(true);
      return;
    }

    if (fetcher.data.alreadySubmitted) {
      setHasAlreadySubmitted(true);
      return;
    }

    if (fetcher.data.error) {
      setError(fetcher.data.error);
    }
  }, [fetcher.state, fetcher.data]);

  useEffect(() => {
    const questionIds = new Set(questions.map((question) => question.id));

    setFormData((prev) => ({
      ...prev,
      answers: prev.answers.filter((answer) => questionIds.has(answer.question_id)),
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

  const handleToggleOptionalFields = () => {
    setShowOptionalFields(!showOptionalFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    if (questions.length !== 3) {
      setError('Perguntas de feedback ainda não configuradas para este QR Code.');
      return;
    }

    const questionIds = new Set(questions.map((question) => question.id));
    const hasAllAnswers =
      formData.answers.length === 3 &&
      formData.answers.every((answer) => questionIds.has(answer.question_id));

    if (!hasAllAnswers) {
      setError('Responda as 3 perguntas antes de enviar.');
      return;
    }

    setError('');

    const answersByQuestionId = new Map(
      formData.answers.map((answer) => [answer.question_id, answer]),
    );

    const orderedAnswers = [...questions]
      .sort((left, right) => left.question_order - right.question_order)
      .map((question) => answersByQuestionId.get(question.id))
      .filter((answer): answer is NonNullable<typeof answer> => Boolean(answer));

    fetcher.submit(
      {
        enterprise_id: formData.enterprise_id,
        collection_point_id: formData.collection_point_id ?? '',
        catalog_item_id: formData.catalog_item_id ?? '',
        message: formData.message.trim(),
        rating: String(formData.rating),
        answers: JSON.stringify(orderedAnswers),
        customer_name: customerData.customer_name ?? '',
        customer_email: customerData.customer_email ?? '',
        customer_gender: customerData.customer_gender ?? '',
      },
      { method: 'post' },
    );
  };

  // Estado quando já enviou feedback anteriormente
  if (hasAlreadySubmitted) {
    return <StateSentPreviousFeedback enterpriseName={enterpriseName} />
  }

  // Error state
  if (error && !formData.enterprise_id) {
    return <StateError error={error} />
  }

  if (isSubmitted) {
    return <StateSubmitted enterpriseName={enterpriseName} />
  }

  return (
    <div className="min-h-screen bg-(--bg-primary) flex items-center justify-center p-4 ">
      <Card
        title="Compartilhe sua Experiência"
        text={
          itemName && itemKindLabel
            ? enterpriseName
              ? `${enterpriseName} · Categoria: ${itemKindLabel} · Item: ${itemName}`
              : `Categoria: ${itemKindLabel} · Item: ${itemName}`
            : enterpriseName
              ? `Conte-nos sobre sua experiência com ${enterpriseName}`
              : 'Seu feedback é muito importante para nós'
        }
        icon={<SVGImageProfile />}
        children={
          <FormQRCodeFeedback
            formData={formData}
            questions={questions}
            customerData={customerData}
            showOptionalFields={showOptionalFields}
            error={error}
            isSubmitting={isSubmitting}
            onFormDataChange={handleFormDataChange}
            onAnswerChange={handleAnswerChange}
            onCustomerDataChange={handleCustomerDataChange}
            onToggleOptionalFields={handleToggleOptionalFields}
            onSubmit={handleSubmit}
          />
        }
      />
    </div>
  );
}
