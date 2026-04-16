import Card from 'components/public/shared/card';
import FormForgotPassword from 'components/public/forms/formForgotPassword';
import SVGLock from 'components/svg/lock';

export default function ForgotPassword() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-(--bg-primary) p-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="w-full max-w-md rounded-[1.75rem] border border-(--quaternary-color)/60 dark:border-(--quaternary-color)/12 bg-linear-to-br from-(--seventh-color) to-(--sixth-color) p-[1px]">
          <Card
            title="Esqueceu sua senha?"
            text="Informe seu e-mail e enviaremos as instruções de recuperação"
            icon={<SVGLock />}
            linkLogin="/login"
            children={<FormForgotPassword />}
          />
        </div>
      </div>

      {/* Elementos decorativos de fundo — mesmo padrão do login.tsx */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-(--primary-color)/6" />
        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-(--secondary-color)/6" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--tertiary-color)/5" />
      </div>
    </div>
  );
}
