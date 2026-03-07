import SVGLock from 'components/svg/lock';
import Card from 'components/public/shared/card';
import FormRegister from 'components/public/forms/formRegister';

export default function Register() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0" />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="rounded-[1.75rem] border border-(--quaternary-color)/12 bg-linear-to-br from-(--seventh-color) to-(--sixth-color) p-[1px]">
          <Card
            icon={<SVGLock />}
            title="Crie sua conta"
            text="Leve, moderno e intuitivo - comece em minutos"
            children={<FormRegister />}
            linkLogin="/login"
          />
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
