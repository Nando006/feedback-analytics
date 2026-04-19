import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { RegisterEmailPendingNoticeProps } from './ui.types';
import { useToast } from 'components/public/forms/messages/useToast';
import { ServiceResendConfirmation } from 'src/services/serviceAuth';

export default function RegisterEmailPendingNotice({
  email,
}: RegisterEmailPendingNoticeProps) {
  const toast = useToast();
  const [isResending, setIsResending] = useState(false);

  const handleResend = useCallback(async () => {
    if (!email) {
      toast.error('E-mail não encontrado', 'Não foi possível identificar o e-mail para reenvio.');
      return;
    }

    setIsResending(true);
    const result = await ServiceResendConfirmation(email);
    setIsResending(false);

    if (result.ok) {
      toast.success('E-mail reenviado!', result.message || 'Verifique sua caixa de entrada.');
    } else {
      toast.error('Falha no reenvio', result.message || 'Tente novamente em instantes.');
    }
  }, [email, toast]);

  return (
    <section
      role="status"
      aria-live="polite"
      className="rounded-xl flex flex-col place-items-center border border-(--positive)/24 bg-(--positive)/8 p-6 gap-6 text-center"
    >
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-(--positive)/35 bg-(--positive)/15">
        <svg
          className="h-6 w-6 text-(--positive)"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 5.5L10 10.75L17.5 5.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="2.5"
            y="4.5"
            width="15"
            height="11"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      </div>

      <h2 className="font-montserrat text-xl font-semibold text-(--text-primary)">
        Cadastro realizado com sucesso!
      </h2>

      <p className="font-work-sans text-sm leading-relaxed text-(--text-secondary)">
        Enviamos um e-mail de confirmação{email ? ` para ${email}` : ''}. Acesse sua caixa de entrada,
        aprove o e-mail recebido e depois realize o login para entrar na plataforma.
      </p>

      <p className="font-work-sans text-sm text-(--text-tertiary)">
        Se não encontrar, verifique também a pasta de spam ou promoções.
      </p>

      <div className='bg-(--negative)/40 border border-(--negative) rounded-md p-2 w-full flex items-center justify-center'>
          <span className="font-work-sans text-sm md:text-md font-bold text-(--negative)">
            Atenção! O acesso só será liberado após a confirmação do e-mail.
          </span>
        </div>

      {/* Bloco de ajuda para quem não encontrou o e-mail */}
      <div className="w-full rounded-lg border border-(--quaternary-color)/20 bg-(--sixth-color)/60 p-4 flex flex-col gap-3">
        <p className="font-work-sans text-sm font-semibold text-(--text-secondary) text-center">
          Não recebeu o e-mail?
        </p>

        {/* Reenviar confirmação */}
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-(--primary-color)/40 bg-(--primary-color)/8 px-5 font-poppins text-sm font-semibold text-(--primary-color) transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResending ? 'Reenviando...' : 'Reenviar e-mail de confirmação'}
        </button>

        {/* Linha divisória com texto */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-(--quaternary-color)/20" />
          <span className="font-work-sans text-xs text-(--text-tertiary)">ou</span>
          <div className="h-px flex-1 bg-(--quaternary-color)/20" />
        </div>

        {/* Links secundários */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/forgot-password"
            className="font-work-sans text-sm text-(--secondary-color) transition-opacity hover:opacity-80"
          >
            Esqueceu a senha?
          </Link>
          <span className="text-(--text-tertiary) text-xs">·</span>
          <Link
            to="/login"
            className="font-work-sans text-sm text-(--text-tertiary) transition-opacity hover:opacity-80"
          >
            Ir para login
          </Link>
        </div>
      </div>

    </section>
  );
}
