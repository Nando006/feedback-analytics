import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Link,
  useActionData,
  useNavigation,
  useSubmit,
} from 'react-router-dom';
import FieldText from './fields/fieldsLogin/fieldText';
import { FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa6';
import FieldPassword from './fields/fieldsLogin/fieldPassword';
import FieldRemember from './fields/fieldsLogin/fieldRemember';
import { useToast } from 'components/public/forms/messages/useToast';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import {
  loginSchema,
  type LoginFormValues,
} from 'lib/schemas/public/loginSchema';
import { ServiceResendConfirmation } from 'src/services/serviceAuth';

function getLoginErrorMessage(actionData: ActionData) {
  if (actionData.error === 'invalid_credentials') {
    return {
      message: 'E-mail ou senha incorretos.',
      description: 'Revise as credenciais e tente novamente.',
    };
  }

  if (actionData.error === 'invalid_payload') {
    return {
      message: 'Dados de login inválidos.',
      description: 'Preencha os campos corretamente antes de continuar.',
    };
  }

  if (actionData.error === 'email_not_confirmed') {
    return {
      message: 'Conta não verificada.',
      description: 'Verifique seu e-mail e clique no link de confirmação para ativar sua conta.',
    };
  }

  return {
    message: 'Não foi possivel realizar o login.',
    description: actionData.message ?? 'Tente novamente em instantes.',
  };
}

export default function FormLogin() {
  const submit = useSubmit();
  const actionData = useActionData() as ActionData | undefined;
  const toast = useToast();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' &&
    (navigation.formAction?.includes('/login') ?? false);

  async function handleResendConfirmation(email: string) {
    if(!email) {
      toast.error('Informe um e-mail válido.');
      return;
    }

    const result = await ServiceResendConfirmation(email);
    if (result.ok) {
      toast.success('E-mail reenviado!', 'Verifique sua caixa de entrada.');
    } else {
      toast.error('Erro ao reenviar', result.message || 'Tente novamente.');
    }
  }

  useEffect(() => {
    if (!actionData?.error) return;

    const { message, description } = getLoginErrorMessage(actionData);
    toast.error(message, description, {
      actionLabel: 'Clique para reenviar e-mail',
      onAction: () => handleResendConfirmation(getValues('email'))
    });
  }, [actionData, toast]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
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
      className="space-y-6 font-work-sans"
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

      <div className="flex items-center justify-between text-(--secondary-color)">
        <FieldRemember
          id="remember"
          name="remember"
          label="Lembrar de mim"
          register={register('remember')}
        />
        <Link
          to="/register"
          className="text-sm text-(--secondary-color) transition-opacity duration-200 hover:opacity-80 font-work-sans">
          Esqueceu a senha ?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-(--primary-color) to-(--tertiary-color) font-poppins font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-80">
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
