import { useEffect } from 'react';
import { useSubmit, useActionData } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailUpdateSchema } from 'lib/schemas/user/emailUpdateSchema';
import { INTENT_PROFILE_UPDATE_EMAIL } from 'src/lib/constants/routes/intents';
import { useToast } from 'components/public/forms/messages/useToast';
import { FaCircleExclamation, FaCircleInfo } from 'react-icons/fa6';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import type { FormEmailUserProps, FormEmailUserValues } from './ui.types';

export default function FormEmailUser({
  defaultEmail = '',
}: FormEmailUserProps) {
  const submit = useSubmit();
  const toast = useToast();
  const actionData = useActionData() as ActionData | undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormEmailUserValues>({
    resolver: zodResolver(emailUpdateSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { email: defaultEmail },
  });

  useEffect(() => {
    if (!actionData) return;

    if (actionData.ok) {
      toast.success('Email atualizado!', 'Confirme a mudança nos dois emails');
    } else {
      toast.error('Erro ao atualizar email', actionData.message || 'Tente novamente em instantes');
    }
  }, [actionData, toast]);

  const onSubmit = () => {
    const v = getValues();
    const fd = new FormData();
    fd.set('intent', INTENT_PROFILE_UPDATE_EMAIL);
    fd.set('initial_email', defaultEmail);
    fd.set('email', v.email);
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
          Endereço de email
        </label>
        <input
          className="w-full rounded-lg border border-(--quaternary-color)/20 bg-white/50 px-4 py-3 text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 transition-all"
          type="email"
          {...register('email')}
          placeholder="seu@email.com"
        />
        {errors.email?.message && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <FaCircleExclamation aria-hidden="true" className="text-red-500" />
            {errors.email.message}
          </p>
        )}
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 flex items-start gap-2">
            <FaCircleInfo aria-hidden="true" className="mt-0.5" />
            <span><span className="font-medium">Importante:</span> Após atualizar, confirme a mudança nos dois emails (antigo e novo) para concluir a alteração.</span>
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          className="btn-primary font-poppins px-6 py-2.5 text-sm font-medium rounded-lg transition-all hover:shadow-lg"
          type="submit">
          Salvar alterações
        </button>
      </div>
    </form>
  );
}
