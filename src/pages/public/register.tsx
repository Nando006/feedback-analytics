import Lock from 'components/public/svg/lock';
import CardForm from 'components/public/cards/cardForm';
import FormRegister from 'components/public/forms/formRegister';

export default function Register() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-800 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-2xl">
        <CardForm
          icon={<Lock />}
          title="Crie sua conta"
          text="Leve, moderno e intuitivo - comece em minutos"
          form={<FormRegister />}
          linkLogin="/login"
        />
      </div>

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
