import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { Link, useSubmit } from 'react-router-dom';
import FieldText from './fields/fieldsLogin/fieldText';
import { FaEnvelope, FaLock } from 'react-icons/fa6';
import FieldPassword from './fields/fieldsLogin/fieldPassword';
import FieldRemember from './fields/fieldsLogin/fieldRemember';
import {
  loginSchema,
  type LoginFormValues,
} from 'lib/schemas/public/loginSchema';

export default function FormLogin() {
  const submit = useSubmit();
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { remember: false },
  });

  const onSubmit = (data: LoginFormValues) => {
    const formData = new FormData();
    if ('email' in data) {
      formData.set('email', data.email);
    } else {
      formData.set('phone', data.phone);
    }
    formData.set('password', data.password);
    formData.set('remember', data.remember ?? false ? 'true' : 'false');

    submit(formData, {
      method: 'post',
      action: '/login',
      encType: 'application/x-www-form-urlencoded',
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate>
      <div className="space-y-4 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm transition-colors ${
              mode === 'email'
                ? 'border-neutral-600 bg-neutral-800 text-neutral-100'
                : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
            }`}
            onClick={() => setMode('email')}>
            E-mail
          </button>
          <button
            type="button"
            className={`inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm transition-colors ${
              mode === 'phone'
                ? 'border-neutral-600 bg-neutral-800 text-neutral-100'
                : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
            }`}
            onClick={() => setMode('phone')}>
            Telefone
          </button>
        </div>

        {mode === 'email' ? (
          <FieldText
            id="email"
            name="email"
            label="E-mail"
            icon={<FaEnvelope />}
            register={register('email')}
            error={
              (
                errors as FieldErrors<
                  Extract<LoginFormValues, { email: string }>
                >
              ).email?.message as string | undefined
            }
          />
        ) : (
          <FieldText
            id="phone"
            name="phone"
            label="Telefone (+55DDXXXXXXXXX)"
            register={register('phone')}
            error={
              (
                errors as FieldErrors<
                  Extract<LoginFormValues, { phone: string }>
                >
              ).phone?.message as string | undefined
            }
          />
        )}
        <FieldPassword
          id="password"
          name="password"
          label="Senha"
          icon={<FaLock />}
          register={register('password')}
          error={errors.password?.message as string | undefined}
        />
      </div>

      <div className="flex items-center justify-between">
        <FieldRemember
          id="remember"
          name="remember"
          label="Lembrar de mim"
          register={register('remember')}
        />
        <Link
          to="/register"
          className="text-sm text-purple-400 hover:text-porple-300 transition-colors hover:text-purple-400/70 duration-200">
          Esqueceu a senha ?
        </Link>
      </div>

      <button className="h-12 w-full bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg cursor-pointer">
        Entrar
      </button>
    </form>
  );
}
