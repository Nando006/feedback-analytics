import { Link } from 'react-router-dom';
import Lock from 'components/public/svg/lock';

export default function Register() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-800 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-2xl">
        <div className="bg-neutral-800/60 backdrop-blur-lg border border-neutral-700/50 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock />
            </div>
            <h1 className="text-2xl font-bold text-neutral-100 mb-2">
              Crie sua conta
            </h1>
            <p className="text-neutral-400">
              Leve, moderno e intuitivo — comece em minutos
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm text-neutral-300">Nome completo</label>
              <div className="h-11 bg-neutral-700/60 border border-neutral-600/50 rounded-lg px-4 flex items-center text-neutral-400 hover:border-neutral-500/70 transition-colors">
                Placeholder do campo
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-neutral-300">E-mail</label>
              <div className="h-11 bg-neutral-700/60 border border-neutral-600/50 rounded-lg px-4 flex items-center text-neutral-400 hover:border-neutral-500/70 transition-colors">
                Placeholder do campo
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-neutral-300">Senha</label>
                <div className="h-11 bg-neutral-700/60 border border-neutral-600/50 rounded-lg px-4 flex items-center text-neutral-400 hover:border-neutral-500/70 transition-colors">
                  Placeholder do campo
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-neutral-300">
                  Confirmar senha
                </label>
                <div className="h-11 bg-neutral-700/60 border border-neutral-600/50 rounded-lg px-4 flex items-center text-neutral-400 hover:border-neutral-500/70 transition-colors">
                  Placeholder do campo
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-5 h-5 rounded-md bg-neutral-700/60 border border-neutral-600/50 shrink-0" />
              <span className="text-neutral-400">
                Concordo com os Termos de Serviço e a Política de Privacidade
              </span>
            </div>

            <button className="btn-register h-12 w-full rounded-lg font-medium shadow-md">
              Criar conta
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-neutral-400 text-sm">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
