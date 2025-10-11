import type { PropsField } from 'lib/interfaces/public/form/propsField';

export default function FieldText({
  id,
  label,
  name,
  icon,
  type = 'text',
  placeholder,
  error,
  register,
}: PropsField) {
  return (
    <div className="space-y-1 relative">
      <label
        htmlFor={name}
        className="flex items-center gap-2 pl-2 text-sm text-neutral-300">
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
        className="h-12 w-full rounded-lg bg-neutral-800/60 border border-neutral-700/60 px-4 outline-none focus:border-purple-600 transition-colors"
        {...register}
      />
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
