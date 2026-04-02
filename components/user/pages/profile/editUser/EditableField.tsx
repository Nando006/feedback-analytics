import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSubmit, useActionData } from 'react-router-dom';
import { useToast } from 'components/public/forms/messages/useToast';
import { FaCircleExclamation, FaFloppyDisk, FaPenToSquare, FaXmark } from 'react-icons/fa6';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import type { EditableFieldProps } from './ui.types';

export default function EditableField({
  label,
  value,
  placeholder,
  type = 'text',
  icon = <FaPenToSquare aria-hidden="true" className="text-(--primary-color)" />,
  schema,
  intent,
  description,
  hint,
  successMessage = 'Dados atualizados!',
  errorMessage = 'Erro ao salvar',
  onEditStart,
  onEditEnd,
  className = '',
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const submit = useSubmit();
  const toast = useToast();
  const actionData = useActionData() as ActionData | undefined;

  const getFieldName = useCallback(() => {
    if (type === 'email') return 'email';
    if (type === 'tel') return 'phone';
    return 'full_name';
  }, [type]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: { [getFieldName()]: value || '' },
  });

  const currentValue = watch(getFieldName());
  const hasChanged = currentValue !== value;
  const fieldName = getFieldName();
  const fieldRegistration = register(fieldName, {
    required: 'Campo obrigatório',
    setValueAs: (value) => value || '',
  });

  useEffect(() => {
    if (!actionData) return;
    if (!isSubmitting) return;

    if (actionData.ok) {
      toast.success(successMessage, 'Alterações salvas com sucesso');
      setIsEditing(false);
      setIsSubmitting(false);
      onEditEnd?.();
    } else {
      toast.error(errorMessage, actionData.message || 'Tente novamente');
      setIsSubmitting(false);
    }
  }, [actionData, isSubmitting, toast, successMessage, errorMessage, onEditEnd]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Reset form quando value muda (dados são carregados)
  useEffect(() => {
    const fieldName = getFieldName();
    reset({ [fieldName]: value || '' });
  }, [value, reset, getFieldName]);

  const handleEdit = () => {
    setIsEditing(true);
    onEditStart?.();
  };

  const handleCancel = () => {
    reset({ [getFieldName()]: value || '' }); // Garantir que nunca seja undefined
    setIsEditing(false);
    setIsSubmitting(false);
    onEditEnd?.();
  };

  const onSubmit = (data: unknown) => {
    const formData = data as Record<string, string>;
    console.log('=== DEBUG EditableField ===');
    console.log('Field name:', fieldName);
    console.log('Original value:', value);
    console.log('Form data:', formData);
    console.log('Form data[fieldName]:', formData[fieldName]);
    console.log('Intent:', intent);

    const fd = new FormData();
    fd.set('intent', intent);
    fd.set(`initial_${fieldName}`, value || '');
    fd.set(fieldName, formData[fieldName] || '');

    // Log FormData contents
    console.log('FormData contents:');
    for (const [key, value] of fd.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    setIsSubmitting(true);
    submit(fd, {
      method: 'post',
      encType: 'application/x-www-form-urlencoded',
    });
  };

  if (isEditing) {
    return (
      <div className={`bg-(--bg-secondary) border-2 border-(--primary-color) rounded-lg p-4 shadow-lg transition-all ${className}`}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-(--text-primary) mb-2">
              {label}
            </label>
            <input
              type={type}
              {...fieldRegistration}
              ref={(element) => {
                fieldRegistration.ref(element);
                inputRef.current = element;
              }}
              placeholder={placeholder}
              className="w-full rounded-lg border border-(--quaternary-color)/30 bg-(--seventh-color) px-4 py-3 text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 transition-all"
            />
            {errors[fieldName]?.message && (
              <p className="mt-1 text-xs text-(--negative) flex items-center gap-1">
                <FaCircleExclamation aria-hidden="true" />
                {String(errors[fieldName]?.message)}
              </p>
            )}
            {hint && (
              <p className="mt-1 text-xs text-(--text-secondary)">{hint}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={!hasChanged || isSubmitting}
              className="px-4 py-2 bg-(--primary-color) text-white rounded-lg text-sm font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaFloppyDisk aria-hidden="true" />
              Salvar
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
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