import CardForm from 'components/public/cards/cardForm';
import FormLogin from 'components/public/forms/formLogin';
import Lock from 'components/public/svg/lock';

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-800 flex items-center justify-center p-4">
      {/* Container principal */}
      <div className="w-full max-w-md">
        <CardForm
          title="Bem-vindo de volta"
          text="Entre na sua conta para continuar"
          linkRegister="/register"
          icon={<Lock />}
          form={<FormLogin />}
        />

        {/* Elementos decorativos */}
        <div className="mt-8 text-center">
          <p className="text-neutral-500 text-xs">
            Ao continuar, você concorda com nossos{' '}
            <a
              href="#"
              className="text-purple-400 hover:text-purple-300 transition-colors">
              Termos de Serviço
            </a>{' '}
            e{' '}
            <a
              href="#"
              className="text-purple-400 hover:text-purple-300 transition-colors">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>

      {/* Elementos de fundo decorativos */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
