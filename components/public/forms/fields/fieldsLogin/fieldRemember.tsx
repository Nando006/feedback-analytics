import type { PropsFieldRemember } from 'lib/interfaces/propsFieldRemember';

export default function FieldRemember({
  id,
  label,
  name,
  register,
}: PropsFieldRemember) {
  return (
    <div className="flex items-center space-x-2">
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
    </div>
  );
}
