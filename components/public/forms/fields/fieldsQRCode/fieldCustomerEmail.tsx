import type { PropsFieldCustomerEmail } from "lib/interfaces/public/propsFieldForm";

export default function FieldCustomerEmail({ email, onEmailChange }: PropsFieldCustomerEmail) {
  return (
    <div>
      <label
        htmlFor="customer_email"
        className="block text-sm font-medium text-neutral-200 mb-2">
        Email
      </label>
      <input
        type="email"
        id="customer_email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder="seu@email.com"
        className="w-full px-4 py-3 border border-neutral-700 rounded-lg bg-neutral-800 text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
      />
    </div>
  );
}
