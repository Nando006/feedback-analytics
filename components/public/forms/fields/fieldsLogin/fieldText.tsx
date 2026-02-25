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
        className="flex flex-row pl-2 space-x-2 cursor-pointer">
        <span>{icon}</span>
        <p className="text-sm">{label}</p>
      </label>
      <input
        type="text"
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        className="h-12 w-full pl-5 bg-(--bg-primary) rounded-lg border border-(--bg-tertiary) outline-none hover:border-(--bg-secondary) focus:border-(--primary-color) duration-200"
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
