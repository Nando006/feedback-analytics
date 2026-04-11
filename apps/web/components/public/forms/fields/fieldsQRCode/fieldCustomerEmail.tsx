import type { FieldCustomerEmailProps } from '../ui.types';

export default function FieldCustomerEmail({ email, onEmailChange }: FieldCustomerEmailProps) {
  return (
    <div>
      <label
        htmlFor="customer_email"
        className="font-work-sans block text-sm font-medium text-(--text-primary) mb-2">
        Email
      </label>
      <input
        type="email"
        id="customer_email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder="seu@email.com"
        className="font-work-sans w-full rounded-lg border border-(--bg-tertiary) bg-(--bg-secondary) px-4 py-3 text-(--text-primary) placeholder-(--text-secondary) transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-(--primary-color)"
      />
    </div>
  );
}
