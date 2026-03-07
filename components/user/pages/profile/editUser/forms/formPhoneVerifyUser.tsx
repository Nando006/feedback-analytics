import { useSubmit } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  phoneVerifySchema,
  type PhoneVerifyFormValues,
} from 'lib/schemas/user/phoneSchema';
import { INTENT_PROFILE_VERIFY_PHONE } from 'lib/constants/routes/intents';

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
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      noValidate>
      <div>
        <label className="mb-1 block text-sm text-(--text-secondary)">
          Código de Verificação (SMS)
        </label>
        <input
          className="w-full rounded-md border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 py-2 text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20"
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
          className="btn-primary h-11 w-full cursor-pointer px-4 text-sm"
          type="submit">
          Confirmar telefone
        </button>
      </div>
    </form>
  );
}
