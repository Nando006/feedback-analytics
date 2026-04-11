import type { FieldFormProps } from '../ui.types';

export default function FieldText({
  id,
  label,
  name,
  icon,
  type = 'text',
  placeholder,
  error,
  register,
}: FieldFormProps) {
  return (
    <div className="space-y-1 relative">
      <label
        htmlFor={name}
        className="flex items-center gap-2 pl-2 text-sm text-(--text-secondary) font-work-sans">
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        autoComplete={type === 'email' ? 'email' : 'off'}
        className="h-12 w-full rounded-lg border border-(--quaternary-color)/18 bg-(--seventh-color) px-4 font-poppins text-(--text-primary) outline-none transition-colors placeholder-(--text-tertiary) hover:border-(--quaternary-color)/30 focus:border-(--primary-color)"
        {...register}
      />
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
