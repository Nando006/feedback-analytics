import type { FieldFormProps } from '../ui.types';

export default function FieldRemember({
  id,
  label,
  name,
  register,
}: FieldFormProps) {
  return (
    <div className="flex items-center space-x-2">
      <input
        id={id}
        name={name}
        type="checkbox"
          className="h-4 w-4 cursor-pointer rounded border border-(--quaternary-color)/18 bg-(--seventh-color) text-(--primary-color) transition-colors duration-200 hover:border-(--quaternary-color)/30 focus:ring-(--primary-color)"
        {...register}
      />
      <label
        htmlFor={id}
        className="text-sm text-(--text-secondary) cursor-pointer">
        {label}
      </label>
    </div>
  );
}
