import type { PropsField } from 'lib/interfaces/form/propsField';

export default function FieldTermsRegister({
  id,
  name,
  label,
  register,
  error,
}: PropsField) {
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        className="w-4 h-4 bg-neutral-700/50 rounded border border-neutral-600/50"
        {...register}
      />
      <label
        htmlFor={id}
        className="text-sm text-neutral-400 cursor-pointer">
        {label}
      </label>
      {error && (
        <span
          role="alert"
          className="text-red-400/70 text-sm font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
