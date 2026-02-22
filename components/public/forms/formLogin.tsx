import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldErrors } from 'react-hook-form';
import { Link, useNavigation, useSubmit } from 'react-router-dom';
import FieldText from './fields/fieldsLogin/fieldText';
import { FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa6';
import FieldPassword from './fields/fieldsLogin/fieldPassword';
import FieldRemember from './fields/fieldsLogin/fieldRemember';
import {
  loginSchema,
  type LoginFormValues,
} from 'lib/schemas/public/loginSchema';

export default function FormLogin() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' &&
    (navigation.formAction?.includes('/login') ?? false);

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
      className="space-y-6 font-work-sans"
      noValidate>
      <div className="space-y-4 pb-2">
        <FieldText
          id="email"
          name="email"
          label="E-mail"
          icon={<FaEnvelope />}
          register={register('email')}
          error={
            (errors as FieldErrors<Extract<LoginFormValues, { email: string }>>)
              .email?.message as string | undefined
          }
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

      <div className="flex items-center justify-between text-(--secondary-color)">
        <FieldRemember
          id="remember"
          name="remember"
          label="Lembrar de mim"
          register={register('remember')}
        />
        <Link
          to="/register"
          className="text-sm text-(--secondary-color) transition-colors hover:text-(--secondary-color-dark) duration-200 font-work-sans">
          Esqueceu a senha ?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="h-12 w-full bg-gradient-to-r from-(--primary-color) to-(--terciary-color-dark) hover:from-(--terciary-color-dark) hover:to-(--primary-color) transition rounded-lg cursor-pointer font-poppins disabled:cursor-not-allowed disabled:opacity-80 flex items-center justify-center gap-2 text-gray-100 font-semibold">
        {isSubmitting ? (
          <>
            <FaSpinner className="animate-spin text-(--text-primary)" aria-hidden="true" />
          </>
        ) : (
          'Entrar'
        )}
      </button>
    </form>
  );
}
