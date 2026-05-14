import { useState, useRef, useEffect } from 'react';
import { useSubmit, useActionData } from 'react-router-dom';
import { useToast } from 'components/public/forms/messages/useToast';
import { FaCircleExclamation, FaFloppyDisk, FaPenToSquare, FaSpinner, FaXmark } from 'react-icons/fa6';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import type { SimpleEditableFieldProps } from './ui.types';

export default function SimpleEditableField({
  label,
  value,
  placeholder,
  type = 'text',
  icon = <FaPenToSquare aria-hidden="true" className="text-(--primary-color)" />,
  intent,
  description,
  hint,
  successMessage = 'Dados atualizados!',
  errorMessage = 'Erro ao salvar',
  className = '',
}: SimpleEditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const submit = useSubmit();
  const toast = useToast();
  const actionData = useActionData() as ActionData | undefined;

  function getFieldName() {
    if (type === 'email') return 'email';
    if (type === 'tel') return 'phone';
    return 'full_name';
  }

  // Sincronizar inputValue com prop value quando ela muda
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Handle action response
  useEffect(() => {
    if (!actionData) return;

    if (actionData.ok) {
      toast.success(successMessage);
      setIsEditing(false);
      setError('');
      setIsSubmitting(false);
      // Atualizar o inputValue com o novo valor
      setInputValue(value || '');
    } else {
      toast.error(errorMessage, actionData.message);
      setError(actionData.message || 'Erro desconhecido');
      setIsSubmitting(false);
    }
  }, [actionData, toast, successMessage, errorMessage, value]);

  const handleEdit = () => {
    setInputValue(value || '');
    setIsEditing(true);
    setError('');
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  const handleCancel = () => {
    setInputValue(value || '');
    setError('');
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!inputValue || inputValue.trim() === '') {
      setError('Campo obrigatório');
      return;
    }

    if (type === 'email' && !inputValue.includes('@')) {
      setError('Email inválido');
      return;
    }

    if (type === 'tel' && !inputValue.match(/^\+55\d{10,11}$/)) {
      setError('Telefone no formato +55DDXXXXXXXXX');
      return;
    }

    const fieldName = getFieldName();
    const fd = new FormData();
    fd.set('intent', intent);
    fd.set(`initial_${fieldName}`, value || '');
    fd.set(fieldName, inputValue.trim());

    setIsSubmitting(true);
    submit(fd, {
      method: 'post',
      encType: 'application/x-www-form-urlencoded',
    });
  };

  // Handle action response
  useState(() => {
    if (actionData) {
      if (actionData.ok) {
        toast.success(successMessage);
        setIsEditing(false);
        setError('');
      } else {
        toast.error(errorMessage, actionData.message);
        setError(actionData.message || 'Erro desconhecido');
      }
    }
  });

  if (isEditing) {
    return (
      <div className={`bg-(--bg-secondary) border-2 border-(--primary-color) rounded-lg p-4 shadow-lg transition-all ${className}`}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-(--text-primary) mb-2">
              {label}
            </label>
            <input
              ref={inputRef}
              type={type}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-lg border border-(--quaternary-color)/30 bg-(--seventh-color) px-4 py-3 text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 transition-all"
            />
            {error && (
              <p className="mt-1 text-xs text-(--negative) flex items-center gap-1">
                <FaCircleExclamation aria-hidden="true" />
                {error}
              </p>
            )}
            {hint && (
              <p className="mt-1 text-xs text-(--text-secondary)">{hint}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-(--primary-color) text-white rounded-lg text-sm font-medium hover:shadow-md transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner aria-hidden="true" className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <FaFloppyDisk aria-hidden="true" />
                  Salvar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-(--quaternary-color)/20 text-(--text-secondary) rounded-lg text-sm font-medium hover:bg-(--quaternary-color)/30 transition-all flex items-center gap-2"
            >
              <FaXmark aria-hidden="true" />
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      className={`group relative bg-(--bg-secondary)/30 border border-(--quaternary-color)/20 rounded-lg p-4 hover:border-(--primary-color)/30 hover:bg-(--primary-color)/5 transition-all cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleEdit}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-(--text-secondary)">{label}</span>
            <span
              className={`text-lg transition-all duration-200 ${isHovered ? 'opacity-100 scale-110' : 'opacity-60 scale-100'
                }`}
            >
              {icon}
            </span>
          </div>
          <p className="text-(--text-primary) font-medium mb-1">{value || 'Não informado'}</p>
          {description && (
            <p className="text-xs text-(--text-tertiary)">{description}</p>
          )}
        </div>

        <div className={`ml-3 transition-all duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-(--primary-color) text-white rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-lg">
            <FaPenToSquare aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Indicador visual de hover */}
      <div className={`absolute inset-0 bg-(--primary-color)/5 rounded-lg transition-opacity duration-200 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
}