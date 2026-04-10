import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { nameSchema, type NameFormValues } from 'lib/schemas/user/nameSchema';
import { useForm } from 'react-hook-form';
import { useSubmit, useActionData } from 'react-router-dom';
import { INTENT_PROFILE_UPDATE_FULL_NAME } from 'lib/constants/routes/intents';
import { useToast } from 'components/public/forms/messages/useToast';
import { FaCircleExclamation } from 'react-icons/fa6';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import type { FormNameUserProps } from './ui.types';

export default function FormNameUser({
  defaultFullName = '',
}: FormNameUserProps) {
  const submit = useSubmit();
  const toast = useToast();
  const actionData = useActionData() as ActionData | undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { full_name: defaultFullName },
  });

  useEffect(() => {
    if (!actionData) return;

    if (actionData.ok) {
      toast.success('Nome atualizado!', 'Dados salvos com sucesso');
    } else {
      toast.error('Erro ao salvar dados', actionData.message || 'Tente novamente em instantes');
    }
  }, [actionData, toast]);

  const onSubmit = () => {
    const v = getValues();
    const fd = new FormData();
    fd.set('intent', INTENT_PROFILE_UPDATE_FULL_NAME);
    fd.set('initial_full_name', defaultFullName);
    fd.set('full_name', v.full_name);
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
          Nome completo
        </label>
        <input
          className="w-full rounded-lg border border-(--quaternary-color)/20 bg-white/50 px-4 py-3 text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 transition-all"
          type="text"
          {...register('full_name')}
          placeholder="Digite seu nome completo"
        />
        {errors.full_name?.message && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <FaCircleExclamation aria-hidden="true" className="text-red-500" />
            {errors.full_name.message}
          </p>
        )}
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
