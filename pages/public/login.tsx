import Card from 'components/public/shared/card';
import FormLogin from 'components/public/forms/formLogin';
import SVGLock from 'components/svg/lock';

export default function Login() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[1.75rem] border border-(--quaternary-color)/12 bg-linear-to-br from-(--seventh-color) to-(--sixth-color) p-[1px]">
          <Card
            title="Bem-vindo de volta"
            text="Entre na sua conta para continuar"
            linkRegister="/register"
            icon={<SVGLock />}
            children={<FormLogin />}
          />
        </div>

        <div className="mt-8 rounded-xl border border-(--quaternary-color)/10 bg-(--sixth-color)/80 px-4 py-3 text-center">
          <p className="text-(--text-tertiary) text-xs font-work-sans">
            Ao continuar, você concorda com nossos{' '}
            <a
              href="#"
              className="text-(--secondary-color) transition-opacity hover:opacity-80">
              Termos de Serviço
            </a>{' '}
            e{' '}
            <a
              href="#"
              className="text-(--secondary-color) transition-opacity hover:opacity-80">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-(--primary-color)/6" />
        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-(--secondary-color)/6" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--tertiary-color)/5" />
      </div>
    </div>
  );
}
