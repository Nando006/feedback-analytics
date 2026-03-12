import { useSubmit } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  phoneStartSchema,
  type PhoneStartFormValues,
} from 'lib/schemas/user/phoneSchema';
import { INTENT_PROFILE_START_PHONE } from 'lib/constants/routes/intents';
import type { FormPhoneStartUserProps } from './ui.types';

export default function FormPhoneStartUser({
  defaultPhone = '',
}: FormPhoneStartUserProps) {
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
      className="font-work-sans grid grid-cols-1 gap-2"
      noValidate>
      <div>
        <label className="mb-1 block text-sm text-(--text-secondary)">
          Phone (+55DDXXXXXXXXX)
        </label>
        <input
          className="w-full rounded-md border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 py-2 text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20"
          type="tel"
          {...register('phone')}
          placeholder="+55DDXXXXXXXXX"
        />
        {errors.phone?.message && (
          <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
        )}
        <p className="mt-1 text-xs text-(--text-tertiary)">
          Enviaremos um código (SMS) para confirmação.
        </p>
      </div>
      <div>
        <button
          className="btn-primary font-poppins h-11 cursor-pointer px-4 text-sm"
          type="submit">
          Enviar código SMS
        </button>
      </div>
    </form>
  );
}
