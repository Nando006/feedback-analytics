import { useSubmit } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailUpdateSchema } from 'lib/schemas/user/emailUpdateSchema';
import { INTENT_PROFILE_UPDATE_EMAIL } from 'src/routes/constants/intents';

type Props = { defaultEmail?: string };
type FormValues = { email: string };

export default function FormEmailUser({ defaultEmail = '' }: Props) {
  const submit = useSubmit();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormValues>({
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
        <label className="mb-1 block text-sm text-neutral-300">Email</label>
        <input
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-500"
          type="email"
          {...register('email')}
          placeholder="seu@email.com"
        />
        {errors.email?.message && (
          <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
        )}
        <p className="mt-1 text-xs text-neutral-400">
          Após atualizar, confirme a mudança no e-mail antigo e no novo para
          concluir.
        </p>
      </div>
      <div>
        <button
          className="h-11 cursor-pointer rounded-md border border-neutral-700 bg-neutral-800 px-4 text-sm font-medium text-neutral-100 hover:bg-neutral-700"
          type="submit">
          Salvar e-mail
        </button>
      </div>
    </form>
  );
}
