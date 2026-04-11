import { useEffect } from 'react';
import { useSubmit, useActionData } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  phoneVerifySchema,
  type PhoneVerifyFormValues,
} from 'lib/schemas/user/phoneSchema';
import { INTENT_PROFILE_VERIFY_PHONE } from 'src/lib/constants/routes/intents';
import { useToast } from 'components/public/forms/messages/useToast';
import { FaCircleExclamation } from 'react-icons/fa6';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import type { FormPhoneVerifyUserProps } from './ui.types';

export default function FormPhoneVerifyUser({ onSuccess }: FormPhoneVerifyUserProps) {
  const submit = useSubmit();
  const toast = useToast();
  const actionData = useActionData() as ActionData | undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<PhoneVerifyFormValues>({
    resolver: zodResolver(phoneVerifySchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { token: '' },
  });

  useEffect(() => {
    if (!actionData) return;

    if (actionData.ok) {
      toast.success('Telefone verificado!', 'Número confirmado com sucesso');
      onSuccess?.(); // Chama o callback quando sucesso
    } else {
      toast.error('Código inválido', actionData.message || 'Verifique o código e tente novamente');
    }
  }, [actionData, toast, onSuccess]);

  const onSubmit = () => {
    const v = getValues();
    const fd = new FormData();
    fd.set('intent', INTENT_PROFILE_VERIFY_PHONE);
    fd.set('token', v.token);
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
          Código de verificação
        </label>
        <input
          className="w-full rounded-lg border border-(--quaternary-color)/20 bg-white/50 px-4 py-3 text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 transition-all text-center text-lg font-mono tracking-widest"
          type="text"
          {...register('token')}
          placeholder="000000"
          maxLength={6}
        />
        {errors.token?.message && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <FaCircleExclamation aria-hidden="true" className="text-red-500" />
            {errors.token.message}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          className="btn-primary font-poppins px-6 py-2.5 text-sm font-medium rounded-lg transition-all hover:shadow-lg"
          type="submit">
          Confirmar telefone
        </button>
      </div>
    </form>
  );
}
