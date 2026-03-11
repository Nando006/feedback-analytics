import Card from 'components/public/shared/card';
import SVGLock from 'components/svg/lock';
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
    <div className="relative flex min-h-screen items-center justify-center bg-(--bg-primary) p-4">
      <div className="w-full max-w-2xl">
        <Card
          icon={<SVGLock />}
          title="Conta verificada"
          text="Sua conta foi confirmada com sucesso. Redirecionando para o dashboard..."
          children={
            <div className="mt-6">
              <Link
                to={params.get('next') ?? '/user/dashboard'}
                className="flex h-12 w-full items-center justify-center rounded-lg border border-(--primary-color)/40 bg-gradient-to-r from-(--primary-color) to-(--tertiary-color) font-medium text-white transition-opacity duration-150 hover:opacity-90 active:translate-y-px">
                Ir agora
              </Link>
            </div>
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
