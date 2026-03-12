import { useSubmit } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailUpdateSchema } from 'lib/schemas/user/emailUpdateSchema';
import { INTENT_PROFILE_UPDATE_EMAIL } from 'lib/constants/routes/intents';
import type { FormEmailUserProps, FormEmailUserValues } from './ui.types';

export default function FormEmailUser({
  defaultEmail = '',
}: FormEmailUserProps) {
  const submit = useSubmit();
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
      className="grid grid-cols-1 gap-2"
      noValidate>
      <div>
        <label className="mb-1 block text-sm text-(--text-secondary)">Email</label>
        <input
          className="w-full rounded-md border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 py-2 text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20"
          type="email"
          {...register('email')}
          placeholder="seu@email.com"
        />
        {errors.email?.message && (
          <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
        )}
        <p className="mt-1 text-xs text-(--text-tertiary)">
          Após atualizar, confirme a mudança no e-mail antigo e no novo para
          concluir.
        </p>
      </div>
      <div>
        <button
          className="btn-primary font-poppins h-11 cursor-pointer px-4 text-sm"
          type="submit">
          Salvar e-mail
        </button>
      </div>
    </form>
  );
}
