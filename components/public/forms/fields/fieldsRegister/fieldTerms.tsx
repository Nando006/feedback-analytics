import type { FieldFormProps } from '../ui.types';

export default function FieldTermsRegister({
  id,
  name,
  label,
  register,
  error,
}: FieldFormProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
          className="h-4 w-4 cursor-pointer rounded border border-(--quaternary-color)/18 bg-(--seventh-color) text-(--primary-color) transition-colors hover:border-(--quaternary-color)/30 focus:ring-(--primary-color)"
        {...register}
      />
      <label
        htmlFor={id}
        className="text-sm text-(--text-secondary) cursor-pointer font-work-sans">
        {label}
      </label>
      {error && (
        <span
          role="alert"
          className="font-work-sans text-(--negative)/70 text-sm font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
