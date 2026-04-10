import { useEffect } from 'react';
import { useSubmit, useActionData } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  phoneStartSchema,
  type PhoneStartFormValues,
} from 'lib/schemas/user/phoneSchema';
import { INTENT_PROFILE_START_PHONE } from 'lib/constants/routes/intents';
import { useToast } from 'components/public/forms/messages/useToast';
import { FaCircleExclamation, FaPhone } from 'react-icons/fa6';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import type { FormPhoneStartUserProps } from './ui.types';

export default function FormPhoneStartUser({
  defaultPhone = '',
  onSuccess,
}: FormPhoneStartUserProps) {
  const submit = useSubmit();
  const toast = useToast();
  const actionData = useActionData() as ActionData | undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<PhoneStartFormValues>({
    resolver: zodResolver(phoneStartSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { phone: defaultPhone },
  });

  useEffect(() => {
    if (!actionData) return;

    if (actionData.ok) {
      toast.success('Código enviado!', 'Verifique seu SMS para continuar');
      onSuccess?.(); // Chama o callback quando sucesso
    } else {
      toast.error('Erro ao enviar código', actionData.message || 'Verifique o número e tente novamente');
    }
  }, [actionData, toast, onSuccess]);

  const onSubmit = () => {
    const v = getValues();
    const fd = new FormData();
    fd.set('intent', INTENT_PROFILE_START_PHONE);
    fd.set('initial_phone', defaultPhone);
    fd.set('phone', v.phone);
    submit(fd, {
      method: 'post',
      encType: 'application/x-www-form-urlencoded',
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="font-work-sans space-y-4"
      noValidate>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-(--text-secondary)">
          Número de telefone
        </label>
        <input
          className="w-full rounded-lg border border-(--quaternary-color)/20 bg-white/50 px-4 py-3 text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 transition-all"
          type="tel"
          {...register('phone')}
          placeholder="+55 (11) 99999-9999"
        />
        {errors.phone?.message && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <FaCircleExclamation aria-hidden="true" className="text-red-500" />
            {errors.phone.message}
          </p>
        )}
        <p className="text-xs text-(--text-secondary) flex items-center gap-1">
          <FaPhone aria-hidden="true" />
          Formato: +55 seguido do DDD e número (apenas números)
        </p>
      </div>

      <div className="flex justify-end">
        <button
          className="btn-primary font-poppins px-6 py-2.5 text-sm font-medium rounded-lg transition-all hover:shadow-lg"
          type="submit">
          Enviar código SMS
        </button>
      </div>
    </form>
  );
}
