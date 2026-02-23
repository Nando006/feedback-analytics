import type { FieldFormProps } from '../ui.types';

export default function FieldAccountTypeRegister({
  id,
  value,
  register,
  error,
}: FieldFormProps) {
  return (
    <div className="space-y-2 relative">
      <span className="font-work-sans pl-2 text-sm text-(--text-secondary)">Tipo de conta</span>
      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2 cursor-pointer font-poppins text-lg">
          <input
            type="radio"
            id={`${id}-cpf`}
            value="CPF"
            defaultChecked={value === 'CPF'}
            {...register}
            className="peer sr-only"
          />
          <span className="px-3 py-2 rounded-md border border-neutral-700/60 bg-(--container-secondary) peer-checked:border-(--primary-color)">
            CPF
          </span>
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer font-poppins text-lg">
          <input
            type="radio"
            id={`${id}-cnpj`}
            value="CNPJ"
            defaultChecked={value === 'CNPJ'}
            {...register}
            className="peer sr-only"
          />
          <span className="px-3 py-2 rounded-md border border-neutral-700/60 bg-(--container-secondary) peer-checked:border-(--primary-color)">
            CNPJ
          </span>
        </label>
      </div>
      {error && (
        <span
          role="alert"
          className="font-work-sans absolute -right-1 -bottom-5 text-(--negative)/70 text-sm font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
