import type { PropsField } from 'lib/interfaces/public/form/propsField';

export default function FieldText({
  id,
  name,
  label,
  icon,
  register,
  error,
}: PropsField) {
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
        className="h-12 w-full pl-5 bg-neutral-700/50 rounded-lg border border-neutral-600/50 outline-none hover:border-neutral-500 focus:border-purple-600 duration-200"
        {...register}
      />
      {error && (
        <span
          role="alert"
          className="absolute right-1 -bottom-5 text-red-400/60 text-sm font-semibold">
          {error}
        </span>
      )}
    </div>
  );
}
