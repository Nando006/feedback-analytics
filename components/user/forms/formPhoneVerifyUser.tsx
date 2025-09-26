import { useSubmit } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  phoneVerifySchema,
  type PhoneVerifyFormValues,
} from 'lib/schemas/user/phoneSchema';

export default function FormPhoneVerifyUser() {
  const submit = useSubmit();
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

  const onSubmit = () => {
    const v = getValues();
    const fd = new FormData();
    fd.set('intent', 'verify_phone');
    fd.set('token', v.token);
    submit(fd, {
      method: 'post',
      encType: 'application/x-www-form-urlencoded',
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      noValidate>
      <div>
        <label className="mb-1 block text-sm text-neutral-300">
          Código de Verificação (SMS)
        </label>
        <input
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-500"
          type="text"
          {...register('token')}
          placeholder="Informe o código recebido"
        />
        {errors.token?.message && (
          <p className="mt-1 text-xs text-red-400">{errors.token.message}</p>
        )}
      </div>
      <div className="flex items-end">
        <button
          className="h-11 w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 text-sm font-medium text-neutral-100 hover:bg-neutral-700 cursor-pointer"
          type="submit">
          Confirmar telefone
        </button>
      </div>
    </form>
  );
}
