import { useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import Card from 'components/public/shared/card';
import SVGImageProfile from 'components/svg/imageProfile';
import { getItemKindLabel } from 'lib/utils/publicQrFeedbackForm';
import { resolvePublicQrFeedbackScope } from 'lib/utils/publicQrFeedbackTemplateEngine';
import StateSentPreviousFeedback from 'components/public/qrcode/enterprise/stateSentPreviousFeedback';
import StateError from 'components/public/qrcode/enterprise/stateError';
import StateSubmitted from 'components/public/qrcode/enterprise/stateSubmitted';
import PublicQrFeedbackTemplateRenderer from 'components/public/qrcode/enterprise/PublicQrFeedbackTemplateRenderer';
import type { LoaderPublicQrCodeEnterprise } from 'src/routes/loaders/loaderPublicQrCodeEnterprise';
import { useQrCodeFeedbackController } from './useQrCodeFeedbackController';

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
  const feedbackScope = useMemo(
    () =>
      resolvePublicQrFeedbackScope({
        itemKind,
        questions,
      }),
    [itemKind, questions],
  );

  const itemKindLabel = getItemKindLabel(itemKind);

  const {
    formData,
    customerData,
    showOptionalFields,
    isSubmitted,
    error,
    hasAlreadySubmitted,
    isSubmitting,
    handleFormDataChange,
    handleAnswerChange,
    handleSubanswerChange,
    handleCustomerDataChange,
    handleToggleOptionalFields,
    handleSubmit,
  } = useQrCodeFeedbackController({
    enterpriseId,
    collectionPointId,
    catalogItemId,
    initialError,
    questions,
  });

  // Estado quando já enviou feedback anteriormente
  if (hasAlreadySubmitted) {
    return <StateSentPreviousFeedback enterpriseName={enterpriseName} />;
  }

  // Error state
  if (error && !formData.enterprise_id) {
    return <StateError error={error} />;
  }

  if (isSubmitted) {
    return <StateSubmitted enterpriseName={enterpriseName} />;
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
          <PublicQrFeedbackTemplateRenderer
            scope={feedbackScope}
            formData={formData}
            questions={questions}
            customerData={customerData}
            showOptionalFields={showOptionalFields}
            error={error}
            isSubmitting={isSubmitting}
            onFormDataChange={handleFormDataChange}
            onAnswerChange={handleAnswerChange}
            onSubanswerChange={handleSubanswerChange}
            onCustomerDataChange={handleCustomerDataChange}
            onToggleOptionalFields={handleToggleOptionalFields}
            onSubmit={handleSubmit}
          />
        }
      />
    </div>
  );
}
