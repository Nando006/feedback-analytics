import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useActionData, useNavigation, useSubmit } from 'react-router-dom';
import { FaEnvelope, FaSpinner } from 'react-icons/fa6';
import { useToast } from 'components/public/forms/messages/useToast';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from 'lib/schemas/public/forgotPasswordSchema';

export default function FormForgotPassword() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData() as ActionData | null;
  const toast = useToast();

  const isSubmitting = navigation.state === 'submitting';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Exibe feedback via toast após a action retornar
  useEffect(() => {
    if (!actionData) return;

    // ok:true vem como { ok: true, message: string } — exibimos sucesso
    if ('ok' in actionData && actionData.ok === true) {
      const msg = (actionData as { ok: true; message: string }).message;
      toast.success('E-mail enviado!', msg);
      return;
    }

    // ok:false — exibimos o erro retornado pela action
    if ('message' in actionData && typeof actionData.message === 'string') {
      toast.error('Não foi possível enviar', actionData.message);
    }
  }, [actionData, toast]);

  function onSubmit(values: ForgotPasswordFormValues) {
    const formData = new FormData();
    formData.set('email', values.email);
    submit(formData, { method: 'post' });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4">

      {/* Campo de e-mail */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="email"
          className="text-sm font-medium text-(--text-secondary)">
          E-mail
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-tertiary)">
            <FaEnvelope size={14} />
          </span>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            {...register('email')}
            className="h-11 w-full rounded-lg border border-(--quaternary-color)/30 bg-(--sixth-color) pl-9 pr-4 text-sm text-(--text-primary) placeholder:text-(--text-tertiary) focus:border-(--primary-color)/60 focus:outline-none focus:ring-1 focus:ring-(--primary-color)/30 transition-colors"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      {/* Botão de envio */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-(--primary-color) to-(--tertiary-color) font-medium text-white transition-opacity hover:opacity-90 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? (
          <FaSpinner className="animate-spin" size={16} />
        ) : (
          'Enviar instruções'
        )}
      </button>

      {/* Link de volta ao login */}
      <p className="text-center text-xs text-(--text-tertiary)">
        Lembrou a senha?{' '}
        <Link
          to="/login"
          className="text-(--secondary-color) font-medium transition-opacity hover:opacity-80">
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}
