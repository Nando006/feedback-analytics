import type { PropsField } from 'lib/interfaces/public/form/propsField';

export default function FieldAccountTypeRegister({
  id,
  value,
  register,
  error,
}: PropsField) {
  return (
    <div className="space-y-2 relative">
      <span className="pl-2 text-sm text-neutral-300">Tipo de conta</span>
      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            id={`${id}-cpf`}
            value="CPF"
            defaultChecked={value === 'CPF'}
            {...register}
            className="peer sr-only"
          />
          <span className="px-3 py-2 rounded-md border border-neutral-700/60 bg-neutral-800/60 peer-checked:border-purple-600">
            CPF
          </span>
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            id={`${id}-cnpj`}
            value="CNPJ"
            defaultChecked={value === 'CNPJ'}
            {...register}
            className="peer sr-only"
          />
          <span className="px-3 py-2 rounded-md border border-neutral-700/60 bg-neutral-800/60 peer-checked:border-purple-600">
            CNPJ
          </span>
        </label>
      </div>
      {error && (
        <span
          role="alert"
          className="absolute -right-1 -bottom-5 text-red-400/70 text-sm font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
