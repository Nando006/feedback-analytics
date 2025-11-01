interface FieldCustomerNameProps {
  name: string;
  onNameChange: (name: string) => void;
}

export default function FieldCustomerName({ name, onNameChange }: FieldCustomerNameProps) {
  return (
    <div>
      <label
        htmlFor="customer_name"
        className="block text-sm font-medium text-neutral-200 mb-2">
        Nome
      </label>
      <input
        type="text"
        id="customer_name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Seu nome"
        className="w-full px-4 py-3 border border-neutral-700 rounded-lg bg-neutral-800 text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
      />
    </div>
  );
}
