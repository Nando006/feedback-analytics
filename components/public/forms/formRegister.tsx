import { zodResolver } from '@hookform/resolvers/zod';
import {
  type RegisterFormValues,
  registerSchema,
} from 'lib/schemas/public/registerSchema';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useActionData, useSubmit } from 'react-router-dom';
import FieldAccountTypeRegister from './fields/fieldsRegister/fieldAccountType';
import FieldText from './fields/fieldsRegister/fieldText';
import FieldDocument from './fields/fieldsRegister/fieldDocument';
import FieldPhoneRegister from './fields/fieldsRegister/fieldPhone';
import FieldPasswordRegister from './fields/fieldsRegister/fieldPassword';
import FieldTermsRegister from './fields/fieldsRegister/fieldTerms';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import { FaSpinner } from 'react-icons/fa6';

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
  const actionData = useActionData() as ActionData | undefined;
  const isSuccess = actionData?.ok === true;

  const onSubmit: SubmitHandler<RegisterFormValues> = (data) => {
    const formData = new FormData();
    formData.set('accountType', data.accountType);

    if (data.accountType === 'CPF') {
      formData.set('document', data.document);
    } else {
      formData.set('document', data.document);
    }

    formData.set('fullName', data.fullName ?? '');
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
          className="rounded-lg border border-(--positive)/30 bg-(--positive)/10 p-4 text-(--text-primary)">
          <div className="text-sm font-work-sans ">
            Conta criada! Enviamos um e-mail de confirmação. Verifique sua caixa
            de entrada e confirme para ativar seu acesso.
          </div>
          <div className="mt-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md bg-(--primary-color) px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
              Ir para o login
            </Link>
          </div>
        </div>
      )}

      {actionData?.error && !isSuccess && (
        <div
          role="alert"
          className="rounded-lg border border-(--negative)/30 bg-(--negative)/10 p-4 text-(--text-primary)">
          <div className="text-sm font-work-sans">
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
        <FieldText
          id="fullName"
          name="fullName"
          label={accountType === 'CPF' ? 'Nome Completo' : 'Nome da Empresa'}
          register={register('fullName')}
          error={errors.fullName?.message as string | undefined}
        />
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
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-(--primary-color) to-(--tertiary-color) font-poppins font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-80"
          disabled={isSubmitting}
          aria-busy={isSubmitting}>
          {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin text-(--text-primary)" aria-hidden="true" />
                    </>
                  ) : (
                    'Criar Conta'
                  )}
        </button>
      </form>
    </div>
  );
}
