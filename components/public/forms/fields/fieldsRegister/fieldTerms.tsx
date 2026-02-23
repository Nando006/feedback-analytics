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
        className="w-4 h-4 bg-(--container-secondary) rounded border border-(--container-border) focus:ring-(--primary-color) transition-colors cursor-pointer"
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
