import { useEffect, useState } from 'react';
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
import type { RegisterIssue } from './ui.types';

const LOGIN_ISSUE_FIELD_PRIORITY = ['email', 'password', 'remember'] as const;

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function parseFormIssues(issues: unknown): RegisterIssue[] {
  if (!Array.isArray(issues)) return [];

  return issues.reduce<RegisterIssue[]>((acc, issue) => {
    if (!issue || typeof issue !== 'object') {
      return acc;
    }

    const maybeIssue = issue as { path?: unknown; message?: unknown };
    const field =
      Array.isArray(maybeIssue.path) && maybeIssue.path.length > 0
        ? String(maybeIssue.path[0])
        : '';
    const message = typeof maybeIssue.message === 'string' ? maybeIssue.message : '';

    if (!field && !message) {
      return acc;
    }

    acc.push({ field, message });
    return acc;
  }, []);
}

function inferLoginErrorByMessage(rawMessage?: string) {
  if (!rawMessage) return null;

  const normalized = normalizeText(rawMessage);

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid credentials') ||
    normalized.includes('e-mail ou senha incorretos')
  ) {
    return {
      message: 'E-mail ou senha incorretos.',
      description: 'Revise as credenciais e tente novamente.',
    };
  }

  if (
    normalized.includes('unable to validate email address') ||
    normalized.includes('invalid email') ||
    normalized.includes('e-mail invalido')
  ) {
    return {
      message: 'E-mail inválido.',
      description: 'Informe um e-mail válido para continuar.',
    };
  }

  if (
    normalized.includes('too many requests') ||
    normalized.includes('rate limit') ||
    normalized.includes('muitas tentativas')
  ) {
    return {
      message: 'Muitas tentativas de login.',
      description: 'Aguarde alguns instantes antes de tentar novamente.',
    };
  }

  if (
    normalized.includes('service unavailable') ||
    normalized.includes('temporarily unavailable') ||
    normalized.includes('servico de login temporariamente indisponivel')
  ) {
    return {
      message: 'Serviço de login temporariamente indisponível.',
      description: 'Tente novamente em alguns instantes.',
    };
  }

  if (
    normalized.includes('network error') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('conectar ao servidor') ||
    normalized.includes('conexao')
  ) {
    return {
      message: 'Falha de conexão.',
      description: 'Verifique sua internet e tente novamente.',
    };
  }

  return null;
}

function getInvalidLoginPayloadErrorMessage(actionData: ActionData) {
  const issues = parseFormIssues(actionData.issues);

  for (const field of LOGIN_ISSUE_FIELD_PRIORITY) {
    const issue = issues.find((item) => item.field === field);
    if (!issue) continue;

    if (field === 'email') {
      return {
        message: 'E-mail inválido.',
        description: issue.message || 'Informe um e-mail válido para continuar.',
      };
    }

    if (field === 'password') {
      return {
        message: 'Senha inválida.',
        description: issue.message || 'A senha deve ter ao menos 6 caracteres.',
      };
    }

    if (field === 'remember') {
      return {
        message: 'Opção de login inválida.',
        description: issue.message || 'Revise os dados de login e tente novamente.',
      };
    }
  }

  const inferredByMessage = inferLoginErrorByMessage(actionData.message);
  if (inferredByMessage) {
    return inferredByMessage;
  }

  return {
    message: 'Dados de login inválidos.',
    description: actionData.message ?? 'Preencha os campos corretamente antes de continuar.',
  };
}

function getLoginErrorMessage(actionData: ActionData) {
  if (actionData.error === 'invalid_payload') {
    return getInvalidLoginPayloadErrorMessage(actionData);
  }

  // RNE-014 (Proteção contra Enumeração de Usuários): tanto credenciais inválidas
  // quanto e-mail não confirmado chegam aqui como 'invalid_credentials' e exibem a
  // MESMA mensagem genérica — a UI nunca revela se a conta existe ou está pendente.
  if (actionData.error === 'invalid_credentials') {
    return {
      message: 'E-mail ou senha incorretos.',
      description: 'Revise as credenciais e tente novamente.',
    };
  }

  if (actionData.error === 'rate_limited') {
    return {
      message: 'Muitas tentativas de login.',
      description: 'Aguarde alguns instantes antes de tentar novamente.',
    };
  }

  if (actionData.error === 'network_error') {
    return {
      message: 'Falha de conexão.',
      description: 'Não foi possível conectar ao servidor de login. Verifique sua internet e tente novamente.',
    };
  }

  if (actionData.error === 'service_unavailable') {
    return {
      message: 'Serviço de login temporariamente indisponível.',
      description: 'Tente novamente em alguns instantes.',
    };
  }

  if (actionData.error === 'login_failed') {
    return {
      message: 'Não foi possível realizar o login.',
      description: actionData.message ?? 'Revise os dados e tente novamente.',
    };
  }

  const inferredByMessage = inferLoginErrorByMessage(actionData.message);
  if (inferredByMessage) {
    return inferredByMessage;
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
  // O loading do botão precisa cobrir TODO o fluxo de login: a autenticação (action
  // /login) E o carregamento da rota de destino (loaders do dashboard) até o redirect
  // concluir. Antes a condição só cobria a fase 'submitting' e o botão voltava a
  // "Entrar" durante o 'loading' do redirect — em produção (loaders mais lentos)
  // parecia ter encerrado, mas a navegação ainda estava em andamento.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Só volta a "Entrar" quando a navegação termina SEM sair da página (ex.: erro de
  // login, que mantém o usuário em /login). No sucesso, o redirect desmonta este
  // form, então o loading persiste naturalmente até o dashboard aparecer.
  useEffect(() => {
    if (navigation.state === 'idle') setIsSubmitting(false);
  }, [navigation.state]);

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

  useEffect(() => {
    if (!actionData?.error && !actionData?.message) return;

    const { message, description } = getLoginErrorMessage(actionData);
    toast.error(message, description);
  }, [actionData, toast]);

  const onSubmit = (data: LoginFormValues) => {
    setIsSubmitting(true);
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
          to="/forgot-password"
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
            <span>Entrando...</span>
          </>
        ) : (
          'Entrar'
        )}
      </button>
    </form>
  );
}
