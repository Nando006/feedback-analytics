import type { PropsCardForm } from 'lib/interfaces/public/cards/propsCard';
import { Link } from 'react-router-dom';

export default function CardForm({
  icon,
  title,
  text,
  form,
  linkRegister,
  linkLogin,
}: PropsCardForm) {
  return (
    <div className="bg-neutral-800/60 backdrop-blur-lg border border-neutral-700/50 rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-8">
        {icon && (
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            {icon}
          </div>
        )}

        <h1 className="text-2xl font-bold text-neutral-100 mb-2">{title}</h1>
        <p className="text-neutral-400">{text}</p>
      </div>

      {form}

      {linkRegister && (
        <div className="mt-8 text-center">
          <p className="text-neutral-400 text-sm">
            Não tem uma conta?{' '}
            <Link
              to={linkRegister}
              className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      )}

      {linkLogin && (
        <div className="mt-8 text-center">
          <p className="text-neutral-400 text-sm">
            Já tem uma conta?{' '}
            <Link
              to={linkLogin}
              className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Entrar
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
