import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CardForm from 'components/public/shared/cards/cardForm';
import SVGImageProfile from 'components/svg/imageProfile';
import { getEnterprisePublic } from 'src/services/enterprisePublic';
import { submitQrcodeFeedback } from 'src/services/qrcode/feedback';
import type { CustomerData, FeedbackData } from 'lib/interfaces/public/qrcode/qrcode';
import StateSentPreviousFeedback from 'components/public/qrcode/enterprise/stateSentPreviousFeedback';
import StateLoading from 'components/public/qrcode/enterprise/stateLoading';
import StateError from 'components/public/qrcode/enterprise/stateError';
import StateSubmitted from 'components/public/qrcode/enterprise/stateSubmitted';

export default function FeedbackQRCodeEnterprise() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<FeedbackData>({
    message: '',
    rating: 0,
    enterprise_id: '',
  });
  const [customerData, setCustomerData] = useState<CustomerData>({});
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
        const enterprise = await getEnterprisePublic(enterpriseId);

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

  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleCustomerDataChange = (
    field: keyof CustomerData,
    value: string | undefined,
  ) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }));
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
      await submitQrcodeFeedback({
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
      <CardForm
        title="Compartilhe sua Experiência"
        text={
          enterpriseName
            ? `Conte-nos sobre sua experiência com ${enterpriseName}`
            : 'Seu feedback é muito importante para nós'
        }
        icon={<SVGImageProfile />}
        form={
          <form
            onSubmit={handleSubmit}
            className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-neutral-200 mb-3">
                Como você avalia nossa experiência?
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    className={`w-12 h-12 rounded-full transition-all duration-200 ${
                      star <= formData.rating
                        ? 'bg-yellow-500 text-white scale-110'
                        : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
                    }`}>
                    <svg
                      className="w-6 h-6 mx-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
              {formData.rating > 0 && (
                <p className="text-center text-sm text-neutral-400 mt-2">
                  {formData.rating === 1 && 'Muito insatisfeito'}
                  {formData.rating === 2 && 'Insatisfeito'}
                  {formData.rating === 3 && 'Neutro'}
                  {formData.rating === 4 && 'Satisfeito'}
                  {formData.rating === 5 && 'Muito satisfeito'}
                </p>
              )}
            </div>

            {/* Mensagem */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-neutral-200 mb-2">
                Conte-nos mais sobre sua experiência
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                placeholder="Descreva sua experiência, sugestões ou comentários..."
                rows={4}
                className="w-full px-4 py-3 border border-neutral-700 rounded-lg bg-neutral-800 text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Toggle para campos opcionais */}
            <div className="border-t border-neutral-700 pt-4">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="flex items-center justify-between w-full text-left text-sm font-medium text-neutral-200 hover:text-purple-400 transition-colors">
                <span>Informações pessoais (opcional)</span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    showOptionalFields ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <p className="text-xs text-neutral-400 mt-1">
                Compartilhe suas informações para nos ajudar a melhorar nossos
                serviços
              </p>
            </div>

            {/* Campos opcionais */}
            {showOptionalFields && (
              <div className="space-y-4 bg-neutral-800/50 p-6 rounded-xl border border-neutral-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-100">
                    Informações Pessoais
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="customer_name"
                      className="block text-sm font-medium text-neutral-200 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      id="customer_name"
                      value={customerData.customer_name || ''}
                      onChange={(e) =>
                        handleCustomerDataChange(
                          'customer_name',
                          e.target.value,
                        )
                      }
                      placeholder="Seu nome"
                      className="w-full px-4 py-3 border border-neutral-700 rounded-lg bg-neutral-800 text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="customer_email"
                      className="block text-sm font-medium text-neutral-200 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="customer_email"
                      value={customerData.customer_email || ''}
                      onChange={(e) =>
                        handleCustomerDataChange(
                          'customer_email',
                          e.target.value,
                        )
                      }
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 border border-neutral-700 rounded-lg bg-neutral-800 text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="customer_gender"
                    className="block text-sm font-medium text-neutral-200 mb-2">
                    Gênero
                  </label>
                  <select
                    id="customer_gender"
                    value={customerData.customer_gender || ''}
                    onChange={(e) =>
                      handleCustomerDataChange(
                        'customer_gender',
                        e.target.value as CustomerData['customer_gender'],
                      )
                    }
                    className="w-full px-4 py-3 border border-neutral-700 rounded-lg bg-neutral-800 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all">
                    <option value="">Selecione...</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                    <option value="prefiro_nao_informar">
                      Prefiro não informar
                    </option>
                  </select>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed">
              {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
            </button>
          </form>
        }
      />
    </div>
  );
}
