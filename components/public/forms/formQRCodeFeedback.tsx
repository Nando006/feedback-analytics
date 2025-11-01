import type { CustomerData, FeedbackData } from 'lib/interfaces/public/qrcode/qrcode';
import FieldRating from './fields/fieldsQRCode/fieldRating';
import FieldMessage from './fields/fieldsQRCode/fieldMessage';
import FieldCustomerName from './fields/fieldsQRCode/fieldCustomerName';
import FieldCustomerEmail from './fields/fieldsQRCode/fieldCustomerEmail';
import FieldCustomerGender from './fields/fieldsQRCode/fieldCustomerGender';

interface FormQRCodeFeedbackProps {
  formData: FeedbackData;
  customerData: CustomerData;
  showOptionalFields: boolean;
  error: string;
  isSubmitting: boolean;
  onFormDataChange: (data: Partial<FeedbackData>) => void;
  onCustomerDataChange: (field: keyof CustomerData, value: string | undefined) => void;
  onToggleOptionalFields: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function FormQRCodeFeedback({
  formData,
  customerData,
  showOptionalFields,
  error,
  isSubmitting,
  onFormDataChange,
  onCustomerDataChange,
  onToggleOptionalFields,
  onSubmit,
}: FormQRCodeFeedbackProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FieldRating
        rating={formData.rating}
        onRatingChange={(rating) => onFormDataChange({ rating })}
      />

      <FieldMessage
        message={formData.message}
        onMessageChange={(message) => onFormDataChange({ message })}
      />

      <div className="border-t border-neutral-700 pt-4">
        <button
          type="button"
          onClick={onToggleOptionalFields}
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
            <FieldCustomerName
              name={customerData.customer_name || ''}
              onNameChange={(value) => onCustomerDataChange('customer_name', value)}
            />
            <FieldCustomerEmail
              email={customerData.customer_email || ''}
              onEmailChange={(value) => onCustomerDataChange('customer_email', value)}
            />
          </div>
          <FieldCustomerGender
            gender={customerData.customer_gender}
            onGenderChange={(value) => onCustomerDataChange('customer_gender', value)}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed">
        {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
      </button>
    </form>
  );
}
