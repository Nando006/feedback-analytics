import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useSubmit } from 'react-router-dom';
import FieldText from './fields/fieldsLogin/fieldText';
import { FaEnvelope, FaLock } from 'react-icons/fa6';
import FieldPassword from './fields/fieldsLogin/fieldPassword';
import FieldRemember from './fields/fieldsLogin/fieldRemember';
import { loginSchema, type LoginFormValues } from 'lib/schemas/loginSchema';

export default function FormLogin() {
  const submit = useSubmit();
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
    formData.set('email', data.email);
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
        <FieldText
          id="email"
          name="email"
          label="E-mail"
          icon={<FaEnvelope />}
          register={register('email')}
          error={errors.email?.message as string | undefined}
        />
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
