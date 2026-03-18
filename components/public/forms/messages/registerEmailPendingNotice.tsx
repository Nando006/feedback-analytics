import { Link } from 'react-router-dom';
import type { RegisterEmailPendingNoticeProps } from './ui.types';

export default function RegisterEmailPendingNotice({
  email,
}: RegisterEmailPendingNoticeProps) {
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

      <div className="flex flex-wrap items-center gap-3 w-full justify-center">
        <Link
          to="/login"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-(--primary-color) to-(--tertiary-color) px-5 font-poppins text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Ir para login
        </Link>
      </div>
    </section>
  );
}
