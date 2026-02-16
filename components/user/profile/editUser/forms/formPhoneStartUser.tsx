import { useSubmit } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  phoneStartSchema,
  type PhoneStartFormValues,
} from 'lib/schemas/user/phoneSchema';
import { INTENT_PROFILE_START_PHONE } from 'src/routes/constants/intents';

type Props = { defaultPhone?: string };

export default function FormPhoneStartUser({ defaultPhone = '' }: Props) {
  const submit = useSubmit();
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
      className="grid grid-cols-1 gap-2"
      noValidate>
      <div>
        <label className="mb-1 block text-sm text-neutral-300">
          Phone (+55DDXXXXXXXXX)
        </label>
        <input
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-500"
          type="tel"
          {...register('phone')}
          placeholder="+55DDXXXXXXXXX"
        />
        {errors.phone?.message && (
          <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
        )}
        <p className="mt-1 text-xs text-neutral-400">
          Enviaremos um código (SMS) para confirmação.
        </p>
      </div>
      <div>
        <button
          className="h-11 cursor-pointer rounded-md border border-neutral-700 bg-neutral-800 px-4 text-sm font-medium text-neutral-100 hover:bg-neutral-700"
          type="submit">
          Enviar código SMS
        </button>
      </div>
    </form>
  );
}
