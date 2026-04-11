import type { FieldCustomerNameProps } from './ui.types';


export default function FieldCustomerName({ name, onNameChange }: FieldCustomerNameProps) {
  return (
    <div>
      <label
        htmlFor="customer_name"
        className="font-work-sans block text-sm font-medium text-(--text-primary) mb-2">
        Nome
      </label>
      <input
        type="text"
        id="customer_name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Seu nome"
        className="font-work-sans w-full rounded-lg border border-(--bg-tertiary) bg-(--bg-secondary) px-4 py-3 text-(--text-primary) placeholder-(--text-secondary) transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-(--primary-color)"
      />
    </div>
  );
}
