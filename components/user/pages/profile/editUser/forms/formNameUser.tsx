import { zodResolver } from '@hookform/resolvers/zod';
import { nameSchema, type NameFormValues } from 'lib/schemas/user/nameSchema';
import { useForm } from 'react-hook-form';
import { useSubmit } from 'react-router-dom';
import { INTENT_PROFILE_UPDATE_FULL_NAME } from 'lib/constants/routes/intents';
import type { FormNameUserProps } from './ui.types';

export default function FormNameUser({
  defaultFullName = '',
}: FormNameUserProps) {
  const submit = useSubmit();
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
      className="grid grid-cols-1 gap-4"
      noValidate>
      <div>
        <label className="mb-1 block text-sm text-(--text-secondary)">
          Display Name
        </label>
        <input
          className="w-full rounded-md border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 py-2 text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20"
          type="text"
          {...register('full_name')}
          placeholder="Seu nome"
        />
        {errors.full_name?.message && (
          <p className="mt-1 text-xs text-red-400">
            {errors.full_name.message}
          </p>
        )}
      </div>
      <div>
        <button
          className="btn-primary h-11 cursor-pointer px-4 text-sm"
          type="submit">
          Salvar nome
        </button>
      </div>
    </form>
  );
}
