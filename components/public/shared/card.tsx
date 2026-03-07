import type { CardProps } from './ui.types';
import { Link } from 'react-router-dom';

export default function Card({
  icon,
  title,
  text,
  children,
  linkRegister,
  linkLogin,
}: CardProps) {
  return (
    <div className="rounded-2xl border border-(--bg-tertiary) bg-(--bg-secondary) p-8">
      <div className="text-center mb-8">
        {icon && (
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-(--primary-color) to-(--tertiary-color) p-2">
            {icon}
          </div>
        )}

        <h1 className="font-montserrat text-2xl font-bold text-(--text-primary) mb-2">{title}</h1>
        <p className="font-work-sans text-(--text-secondary)">{text}</p>
      </div>

      {children}

      {linkRegister && (
        <div className="mt-8 text-center">
          <p className="text-(--text-secondary) text-sm font-work-sans">
            Não tem uma conta?{' '}
            <Link
              to={linkRegister}
              className="font-poppins font-medium text-(--secondary-color) transition-opacity hover:opacity-80">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      )}

      {linkLogin && (
        <div className="mt-8 text-center">
          <p className="text-(--text-secondary) text-sm font-work-sans">
            Já tem uma conta?{' '}
            <Link
              to={linkLogin}
              className="font-poppins font-medium text-(--secondary-color) transition-opacity hover:opacity-80">
              Entrar
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
