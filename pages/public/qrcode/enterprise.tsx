import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from 'components/public/shared/card';
import SVGImageProfile from 'components/svg/imageProfile';
import { ServiceGetEnterprisePublic } from 'src/services/ServiceEnterprise';
import { ServiceSubmitQrcodeFeedback } from 'src/services/ServiceFeedbackQRCode';
import type { PropsCustomerData, PropsFeedbackData } from 'lib/interfaces/public/propsQRcode';
import StateSentPreviousFeedback from 'components/public/qrcode/enterprise/stateSentPreviousFeedback';
import StateLoading from 'components/public/qrcode/enterprise/stateLoading';
import StateError from 'components/public/qrcode/enterprise/stateError';
import StateSubmitted from 'components/public/qrcode/enterprise/stateSubmitted';
import FormQRCodeFeedback from 'components/public/forms/formQRCodeFeedback';

export default function FeedbackQRCodeEnterprise() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<PropsFeedbackData>({
    message: '',
    rating: 0,
    enterprise_id: '',
  });
  const [customerData, setCustomerData] = useState<PropsCustomerData>({});
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isValidatingEnterprise, setIsValidatingEnterprise] = useState(true);
  const [enterpriseName, setEnterpriseName] = useState('');
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false);

  useEffect(() => {
    const validateEnterprise = async () => {
      const enterpriseId = searchParams.get('enterprise');

      if (!enterpriseId) {
        setError('ID da empresa não encontrado na URL. Verifique o QR Code.');
        setIsValidatingEnterprise(false);
        return;
      }

      try {
        // Verificar se a empresa existe usando service
        const enterprise = await ServiceGetEnterprisePublic(enterpriseId);

        setFormData((prev) => ({ ...prev, enterprise_id: enterpriseId }));
        setEnterpriseName(enterprise.name || 'Empresa');
        setIsValidatingEnterprise(false);
      } catch (err: unknown) {
        console.error('Erro ao validar empresa:', err);
        setError('Empresa não encontrada. Verifique se o QR Code é válido.');
        setIsValidatingEnterprise(false);
      }
    };

    validateEnterprise();
  }, [searchParams]);

  const handleFormDataChange = (data: Partial<PropsFeedbackData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleCustomerDataChange = (
    field: keyof PropsCustomerData,
    value: string | undefined,
  ) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }));
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

    setIsSubmitting(true);
    setError('');

    try {
      // Usar service para enviar feedback
      await ServiceSubmitQrcodeFeedback({
        message: formData.message.trim(),
        rating: formData.rating,
        channel: 'QRCODE',
        enterprise_id: formData.enterprise_id,
        ...customerData,
      });

      setIsSubmitted(true);
    } catch (err: unknown) {
      console.error('Erro ao enviar feedback:', err);

      // Tratar erro específico de dispositivo já submetido
      if (
        err &&
        typeof err === 'object' &&
        'status' in err &&
        err.status === 409
      ) {
        setHasAlreadySubmitted(true);
        return;
      }

      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Erro ao enviar feedback. Tente novamente.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state durante validação da empresa
  if (isValidatingEnterprise) {
    return <StateLoading />
  }

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
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-800 flex items-center justify-center p-4">
      <Card
        title="Compartilhe sua Experiência"
        text={
          enterpriseName
            ? `Conte-nos sobre sua experiência com ${enterpriseName}`
            : 'Seu feedback é muito importante para nós'
        }
        icon={<SVGImageProfile />}
        children={
          <FormQRCodeFeedback
            formData={formData}
            customerData={customerData}
            showOptionalFields={showOptionalFields}
            error={error}
            isSubmitting={isSubmitting}
            onFormDataChange={handleFormDataChange}
            onCustomerDataChange={handleCustomerDataChange}
            onToggleOptionalFields={handleToggleOptionalFields}
            onSubmit={handleSubmit}
          />
        }
      />
    </div>
  );
}
