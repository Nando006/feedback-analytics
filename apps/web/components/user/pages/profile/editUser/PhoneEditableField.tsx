import { useState, useEffect } from 'react';
import { useSubmit, useActionData } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { phoneStartSchema, phoneVerifySchema } from 'lib/schemas/user/phoneSchema';
import { INTENT_PROFILE_START_PHONE, INTENT_PROFILE_VERIFY_PHONE } from 'src/lib/constants/routes/intents';
import { useToast } from 'components/public/forms/messages/useToast';
import { FaCircleCheck, FaCircleExclamation, FaPaperPlane, FaPenToSquare, FaPhone, FaXmark } from 'react-icons/fa6';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import type { PhoneEditableFieldProps } from './ui.types';

export default function PhoneEditableField({ currentPhone, className = '' }: PhoneEditableFieldProps) {
  const [mode, setMode] = useState<'view' | 'edit' | 'verify'>('view');
  const [isHovered, setIsHovered] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');
  const [submitStage, setSubmitStage] = useState<'start' | 'verify' | null>(null);
  const [actionDataAtSubmit, setActionDataAtSubmit] = useState<ActionData | undefined>(undefined);

  // Garantir que currentPhone nunca seja undefined
  const safeCurrentPhone = currentPhone || '';

  const submit = useSubmit();
  const toast = useToast();
  const actionData = useActionData() as ActionData | undefined;

  // Form para alterar telefone
  const phoneForm = useForm({
    resolver: zodResolver(phoneStartSchema),
    defaultValues: { phone: safeCurrentPhone },
  });

  // Form para verificar código
  const verifyForm = useForm({
    resolver: zodResolver(phoneVerifySchema),
    defaultValues: { token: '' },
  });

  useEffect(() => {
    if (!submitStage) return;
    if (!actionData) return;
    if (actionData === actionDataAtSubmit) return;

    if (actionData.ok) {
      if (submitStage === 'start') {
        // SMS enviado com sucesso
        toast.success('Código enviado!', 'Verifique seu SMS');
        setPendingPhone(phoneForm.getValues().phone);
        setMode('verify');
      } else if (submitStage === 'verify') {
        // Telefone verificado com sucesso
        toast.success('Telefone atualizado!', 'Número confirmado');
        setMode('view');
        verifyForm.reset();
        setPendingPhone('');
      }
    } else {
      const message = submitStage === 'start'
        ? 'Erro ao enviar código'
        : 'Código inválido';
      toast.error(message, actionData.message || 'Tente novamente');
    }
    setSubmitStage(null);
    setActionDataAtSubmit(undefined);
  }, [actionData, actionDataAtSubmit, toast, submitStage, phoneForm, verifyForm]);

  const handleEdit = () => {
    setMode('edit');
  };

  const handleCancel = () => {
    phoneForm.reset({ phone: safeCurrentPhone });
    verifyForm.reset({ token: '' });
    setPendingPhone('');
    setSubmitStage(null);
    setActionDataAtSubmit(undefined);
    setMode('view');
  };

  const handlePhoneSubmit = (data: { phone: string }) => {
    setActionDataAtSubmit(actionData);
    setSubmitStage('start');
    const fd = new FormData();
    fd.set('intent', INTENT_PROFILE_START_PHONE);
    fd.set('initial_phone', safeCurrentPhone);
    fd.set('phone', data.phone);
    submit(fd, { method: 'post', encType: 'application/x-www-form-urlencoded' });
  };

  const handleVerifySubmit = (data: { token: string }) => {
    setActionDataAtSubmit(actionData);
    setSubmitStage('verify');
    const fd = new FormData();
    fd.set('intent', INTENT_PROFILE_VERIFY_PHONE);
    fd.set('token', data.token);
    submit(fd, { method: 'post', encType: 'application/x-www-form-urlencoded' });
  };

  // Modo de visualização
  if (mode === 'view') {
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
              <span className="text-sm font-medium text-(--text-secondary)">Telefone</span>
              <span
                className={`text-lg transition-all duration-200 ${isHovered ? 'opacity-100 scale-110' : 'opacity-60 scale-100'
                  }`}
              >
                <FaPhone aria-hidden="true" className="text-(--primary-color)" />
              </span>
            </div>
            <p className="text-(--text-primary) font-medium mb-1">
              {safeCurrentPhone || 'Não informado'}
            </p>
            <p className="text-xs text-(--text-tertiary)">
              Usado para notificações e recuperação de conta
            </p>
          </div>

          <div className={`ml-3 transition-all duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-(--primary-color) text-white rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-lg">
              <FaPenToSquare aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className={`absolute inset-0 bg-(--primary-color)/5 rounded-lg transition-opacity duration-200 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      </div>
    );
  }

  // Modo de edição (alterar número)
  if (mode === 'edit') {
    return (
      <div className={`bg-(--bg-secondary) border-2 border-(--primary-color) rounded-lg p-4 shadow-lg transition-all ${className}`}>
        <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-(--text-primary) mb-2">
              Novo número de telefone
            </label>
            <input
              type="tel"
              {...phoneForm.register('phone')}
              placeholder="+55 (11) 99999-9999"
              disabled={submitStage === 'start'}
              className="w-full rounded-lg border border-(--quaternary-color)/30 bg-(--seventh-color) px-4 py-3 text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 transition-all"
              autoFocus
            />
            {phoneForm.formState.errors.phone?.message && (
              <p className="mt-1 text-xs text-(--negative) flex items-center gap-1">
                <FaCircleExclamation aria-hidden="true" />
                {phoneForm.formState.errors.phone.message}
              </p>
            )}
            <p className="mt-1 text-xs text-(--text-secondary)">
              Formato: +55 seguido do DDD e número
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={submitStage === 'start'}
              className="px-4 py-2 bg-(--primary-color) text-white rounded-lg text-sm font-medium hover:shadow-md transition-all flex items-center gap-2"
            >
              <FaPaperPlane aria-hidden="true" />
              Enviar SMS
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitStage === 'start'}
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

  // Modo de verificação (inserir código SMS)
  return (
    <div className={`bg-(--bg-secondary) border-2 border-(--positive) rounded-lg p-4 shadow-lg transition-all ${className}`}>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-(--positive) rounded-full flex items-center justify-center text-white text-sm">
            <FaCircleCheck aria-hidden="true" />
          </div>
          <span className="text-sm font-medium" style={{ color: 'var(--positive)' }}>SMS enviado para {pendingPhone}</span>
        </div>
        <p className="text-xs text-(--text-secondary)">
          Digite o código de 6 dígitos que você recebeu
        </p>
      </div>

      <form onSubmit={verifyForm.handleSubmit(handleVerifySubmit)} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-(--text-primary) mb-2">
            Código de verificação
          </label>
          <input
            type="text"
            {...verifyForm.register('token')}
            placeholder="000000"
            maxLength={6}
            disabled={submitStage === 'verify'}
            className="w-full rounded-lg border border-(--quaternary-color)/30 bg-(--seventh-color) px-4 py-3 text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 transition-all text-center text-lg font-mono tracking-widest"
            autoFocus
          />
          {verifyForm.formState.errors.token?.message && (
            <p className="mt-1 text-xs text-(--negative) flex items-center gap-1">
              <FaCircleExclamation aria-hidden="true" />
              {verifyForm.formState.errors.token.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={submitStage === 'verify'}
            className="px-4 py-2 bg-(--positive) text-white rounded-lg text-sm font-medium hover:shadow-md transition-all flex items-center gap-2"
          >
            <FaCircleCheck aria-hidden="true" />
            Confirmar
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitStage === 'verify'}
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