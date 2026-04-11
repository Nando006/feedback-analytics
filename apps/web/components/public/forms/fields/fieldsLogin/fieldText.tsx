import type { FieldFormProps } from '../ui.types';

export default function FieldText({
  id,
  name,
  label,
  icon,
  register,
  error,
}: FieldFormProps) {
  return (
    <div className="space-y-1 relative">
      <label
        htmlFor={name}
        className="flex flex-row pl-2 space-x-2 cursor-pointer text-(--text-secondary) font-work-sans">
        <span>{icon}</span>
        <p className="text-sm">{label}</p>
      </label>
      <input
        type="text"
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
          className="h-12 w-full rounded-lg border border-(--quaternary-color)/18 bg-(--seventh-color) pl-5 text-(--text-primary) outline-none transition-colors duration-200 placeholder-(--text-tertiary) hover:border-(--quaternary-color)/30 focus:border-(--primary-color)"
        {...register}
      />
      {error && (
        <span
          role="alert"
          className="absolute right-1 -bottom-5 text-(--negative) text-sm font-semibold">
          {error}
        </span>
      )}
    </div>
  );
}
