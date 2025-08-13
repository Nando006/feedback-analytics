import { zodResolver } from '@hookform/resolvers/zod';
import {
  type RegisterFormValues,
  registerSchema,
} from 'lib/schemas/registerSchema';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useSubmit } from 'react-router-dom';
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
        register={register('document')}
        error={errors.document?.message as string | undefined}
      />

      <FieldPhoneRegister
        id="phone"
        name="phone"
        label="Contato (Celular DDD +55 fixo)"
        register={register('phone')}
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
  );
}
