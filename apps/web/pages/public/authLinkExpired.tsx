import Card from 'components/public/shared/card';
import SVGLock from 'components/svg/lock';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ServiceResendConfirmation } from 'src/services/serviceAuth';

export default function AuthLinkExpired() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleResend() {
    if (!email) return;
    setLoading(true);
    setError('');
    const result = await ServiceResendConfirmation(email);
    setLoading(false);
    if (result.ok) {
      setSent(true);
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-(--bg-primary) p-4">
      <div className="w-full max-w-2xl">
        <Card
          icon={<SVGLock />}
          title="Link expirado"
          text={
            sent
              ? 'E-mail reenviado! Verifique sua caixa de entrada e clique no novo link de confirmação.'
              : 'O link de confirmação expirou. Informe seu e-mail para receber um novo.'
          }
          children={
            sent ? (
              <div className="mt-6">
                <Link
                  to="/login"
                  className="flex h-12 w-full items-center justify-center rounded-lg border border-(--primary-color)/40 bg-gradient-to-r from-(--primary-color) to-(--tertiary-color) font-medium text-white transition-opacity duration-150 hover:opacity-90 active:translate-y-px">
                  Ir para o login
                </Link>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleResend()}
                  className="h-12 w-full rounded-lg border border-(--border-color) bg-(--bg-secondary) px-4 text-sm text-(--text-primary) outline-none focus:border-(--primary-color) focus:ring-1 focus:ring-(--primary-color)"
                />
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                <button
                  onClick={handleResend}
                  disabled={loading || !email}
                  className="flex h-12 w-full items-center justify-center rounded-lg border border-(--primary-color)/40 bg-gradient-to-r from-(--primary-color) to-(--tertiary-color) font-medium text-white transition-opacity duration-150 hover:opacity-90 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50">
                  {loading ? 'Enviando...' : 'Reenviar e-mail'}
                </button>
                <Link
                  to="/login"
                  className="text-center text-sm text-(--text-secondary) hover:text-(--text-primary)">
                  Voltar ao login
                </Link>
              </div>
            )
          }
          linkLogin="/login"
        />
      </div>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-(--primary-color)/10" />
        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-(--secondary-color)/10" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--tertiary-color)/8" />
      </div>
    </div>
  );
}
