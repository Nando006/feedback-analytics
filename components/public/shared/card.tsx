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
    <div className="bg-(--container-secondary)/80 backdrop-blur-lg border border-(--bg-secondary) rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-8">
        {icon && (
          <div className="w-16 h-16 p-2 bg-gradient-to-br from-(--primary-color) to-(--terciary-color-dark) rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
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
              className="text-(--secondary-color) hover:text-(--secondary-color-dark) transition-colors font-medium font-poppins">
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
              className="text-(--secondary-color) hover:text-(--secondary-color-dark) transition-colors font-medium font-poppins">
              Entrar
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
