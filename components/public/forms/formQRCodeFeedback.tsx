import FieldRating from './fields/fieldsQRCode/fieldRating';
import FieldMessage from './fields/fieldsQRCode/fieldMessage';
import FieldCustomerName from './fields/fieldsQRCode/fieldCustomerName';
import FieldCustomerEmail from './fields/fieldsQRCode/fieldCustomerEmail';
import FieldCustomerGender from './fields/fieldsQRCode/fieldCustomerGender';
import type { FormQRCodeFeedbackProps } from './fields/fieldsQRCode/ui.types';
import { FaSpinner } from 'react-icons/fa6';

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

      <div className="border-t border-(--container-border) pt-4">
        <button
          type="button"
          onClick={onToggleOptionalFields}
          className="flex items-center justify-between w-full text-left text-sm font-medium text-(--text-secondary) hover:text-(--primary-color) transition-colors font-work-sans">
          <span>Informações pessoais (opcional)</span>
          <svg
            className={`w-5 h-5 transition-transform ${showOptionalFields ? 'rotate-180' : ''
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
        <p className="text-xs text-(--text-muted) font-work-sans mt-1">
          Compartilhe suas informações para nos ajudar a melhorar nossos
          serviços
        </p>
      </div>

      {showOptionalFields && (
        <div className="space-y-4 bg-(--container-secondary)/50 p-6 rounded-xl border border-(--container-border)">
          <div className="flex items-center mb-4 gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-(--primary-color) to-(--terciary-color-dark) rounded-lg flex items-center justify-center">
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
            <h3 className="text-lg font-semibold text-(--text-primary) font-montserrat">
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
        className="w-full bg-gradient-to-r from-(--primary-color) to-(--tertiary-color-dark) hover:from-(--tertiary-color-dark) hover:to-(--primary-color) disabled:bg-neutral-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed font-poppins cursor-pointer">
        {isSubmitting ? (
          <>
            <FaSpinner className="animate-spin text-gray-100 mx-auto" aria-hidden="true" />
          </>
        ) : (
          'Enviar Feedback'
        )}
      </button>
    </form>
  );
}
