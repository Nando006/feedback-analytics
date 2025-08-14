import { zodResolver } from '@hookform/resolvers/zod';
import {
  type RegisterFormValues,
  registerSchema,
} from 'lib/schemas/registerSchema';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useActionData, useSubmit } from 'react-router-dom';
import FieldAccountTypeRegister from './fields/fieldRegister/fieldAccountType';
import FieldText from './fields/fieldRegister/fieldText';
import FieldDocument from './fields/fieldRegister/fieldDocument';
import FieldPhoneRegister from './fields/fieldRegister/fieldPhone';
import FieldPasswordRegister from './fields/fieldRegister/fieldPassword';
import FieldTermsRegister from './fields/fieldRegister/fieldTerms';

export default function FormRegister() {
  const submit = useSubmit();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      accountType: 'CPF',
      terms: false,
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      document: '',
      fullName: '',
    },
  });

  const accountType = watch('accountType') ?? 'CPF';

  type ActionData = {
    ok?: boolean;
    error?: string;
    message?: string;
    issues?: unknown;
  };
  const actionData = useActionData() as ActionData | undefined;
  const isSuccess = actionData?.ok === true;

  const onSubmit: SubmitHandler<RegisterFormValues> = (data) => {
    const formData = new FormData();
    formData.set('accountType', data.accountType);

    if (data.accountType === 'CPF') {
      formData.set('fullName', data.fullName ?? '');
      formData.set('document', data.document);
    } else {
      formData.set('companyName', data.companyName ?? '');
      formData.set('document', data.document);
    }

    formData.set('email', data.email);
    formData.set('phone', data.phone);
    formData.set('password', data.password);
    formData.set('confirmPassword', data.confirmPassword);
    formData.set('terms', data.terms ? 'true' : 'false');

    submit(formData, {
      method: 'post',
      action: '/register',
      encType: 'application/x-www-form-urlencoded',
    });
  };

  return (
    <div>
      {isSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-green-600/40 bg-green-500/10 p-4 text-green-200">
          <div className="text-sm">
            Conta criada! Enviamos um e-mail de confirmação. Verifique sua caixa
            de entrada e confirme para ativar seu acesso.
          </div>
          <div className="mt-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 transition-colors">
              Ir para o login
            </Link>
          </div>
        </div>
      )}

      {actionData?.error && !isSuccess && (
        <div
          role="alert"
          className="rounded-lg border border-red-600/40 bg-red-500/10 p-4 text-red-200">
          <div className="text-sm">
            Não foi possível criar sua conta.{' '}
            {actionData.message ?? 'Verifique os campos e tente novamente.'}
          </div>
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-5">
        <FieldAccountTypeRegister
          id="accountType"
          name="accountType"
          value={accountType}
          register={register('accountType')}
          error={errors.accountType?.message as string | undefined}
        />
        {accountType === 'CPF' ? (
          <FieldText
            id="fullName"
            name="fullName"
            label="Nome Completo"
            register={register('fullName' as any)}
            error={(errors as any).fullName?.message as string | undefined}
          />
        ) : (
          <FieldText
            id="companyName"
            name="companyName"
            label="Nome da Empresa"
            register={register('companyName' as any)}
            error={(errors as any).companyName?.message as string | undefined}
          />
        )}
        <FieldText
          id="email"
          name="email"
          type="email"
          label="E-mail"
          register={register('email')}
          error={errors.email?.message as string | undefined}
        />
        <FieldDocument
          id="document"
          name="document"
          label={accountType === 'CNPJ' ? 'CNPJ' : 'CPF'}
          docType={accountType}
          register={register('document', {
            setValueAs: (v) => {
              const s = typeof v === 'string' ? v : '';
              return s.replace(/\D+/g, '').slice(0, 14);
            },
          })}
          error={errors.document?.message as string | undefined}
        />
        <FieldPhoneRegister
          id="phone"
          name="phone"
          label="Contato (Celular DDD +55 fixo)"
          register={register('phone', {
            setValueAs: (v) => {
              const s = typeof v === 'string' ? v : '';
              const digits = s.replace(/\D+/g, '');
              const local = digits.startsWith('55') ? digits.slice(2) : digits;
              const localTrimmed = local.slice(0, 11);
              return `+55${localTrimmed}`;
            },
          })}
          error={errors.phone?.message as string | undefined}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldPasswordRegister
            id="password"
            name="password"
            label="Senha"
            register={register('password')}
            error={errors.password?.message as string | undefined}
          />
          <FieldPasswordRegister
            id="confirmPassword"
            name="confirmPassword"
            label="Confirmar senha"
            register={register('confirmPassword')}
            error={errors.confirmPassword?.message as string | undefined}
          />
        </div>
        <FieldTermsRegister
          id="terms"
          name="terms"
          label="Concordo com os Termos de Serviço e a Política de Privacidade"
          register={register('terms')}
          error={errors.terms?.message as string | undefined}
        />
        <button
          className="btn-register h-12 w-full rounded-lg font-medium shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isSubmitting}
          aria-busy={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar conta'}
        </button>
      </form>
    </div>
  );
}
