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
          <span className="rounded-md border border-(--quaternary-color)/18 bg-(--seventh-color) px-3 py-2 text-(--text-secondary) transition-colors hover:border-(--quaternary-color)/30 peer-checked:border-(--primary-color) peer-checked:bg-(--primary-color)/10 peer-checked:text-(--text-primary)">
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
          <span className="rounded-md border border-(--quaternary-color)/18 bg-(--seventh-color) px-3 py-2 text-(--text-secondary) transition-colors hover:border-(--quaternary-color)/30 peer-checked:border-(--primary-color) peer-checked:bg-(--primary-color)/10 peer-checked:text-(--text-primary)">
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
