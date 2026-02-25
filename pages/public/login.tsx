import Card from 'components/public/shared/card';
import FormLogin from 'components/public/forms/formLogin';
import SVGLock from 'components/svg/lock';

export default function Login() {
  return (
    <div className="min-h-screen bg-(--bg-color) flex items-center justify-center p-4">
      {/* Container principal */}
      <div className="w-full max-w-md">
        <Card
          title="Bem-vindo de volta"
          text="Entre na sua conta para continuar"
          linkRegister="/register"
          icon={<SVGLock />}
          children={<FormLogin />}
        />

        {/* Elementos decorativos */}
        <div className="mt-8 text-center">
          <p className="text-neutral-500 text-xs font-work-sans">
            Ao continuar, você concorda com nossos{' '}
            <a
              href="#"
              className="text-(--secondary-color) hover:text-(--secondary-color-dark) transition-colors">
              Termos de Serviço
            </a>{' '}
            e{' '}
            <a
              href="#"
              className="text-(--secondary-color) hover:text-(--secondary-color-dark) transition-colors">
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
