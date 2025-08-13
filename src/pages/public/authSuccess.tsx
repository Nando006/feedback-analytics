import CardForm from 'components/public/cards/cardForm';
import Lock from 'components/public/svg/lock';
import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const next = params.get('next') ?? '/user/dashboard';
    const id = setTimeout(() => navigate(next), 1500);
    return () => clearTimeout(id);
  }, [params, navigate]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-800 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-2xl">
        <CardForm
          icon={<Lock />}
          title="Conta verificada"
          text="Sua conta foi confirmada com sucesso. Redirecionando para o dashboard..."
          form={
            <div className="mt-6">
              <Link
                to={params.get('next') ?? '/user/dashboard'}
                className="btn-register h-12 w-full rounded-lg font-medium shadow-md flex items-center justify-center">
                Ir agora
              </Link>
            </div>
          }
          linkLogin="/login"
        />
      </div>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
