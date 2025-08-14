import type { PropsField } from 'lib/interfaces/public/form/propsField';
import { useState } from 'react';

function digitsOnly(value: string) {
  return (value || '').replace(/\D+/g, '');
}
function formatBR(raw: string) {
  const d = digitsOnly(raw).slice(0, 13); // 55 + 11
  const only = d.startsWith('55') ? d : `55${d}`;
  const country = '+55';
  const local = only.slice(2);
  const ddd = local.slice(0, 2);
  const rest = local.slice(2);
  if (rest.length <= 4) return `${country} (${ddd}${rest ? `) ${rest}` : ')'}`;
  if (rest.length <= 9)
    return `${country} (${ddd}) ${rest.slice(0, rest.length - 4)}-${rest.slice(
      -4,
    )}`;
  return `${country} (${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
}

export default function FieldPhoneRegister({
  id,
  name,
  label,
  register,
  error,
}: PropsField) {
  const [display, setDisplay] = useState('');

  return (
    <div className="space-y-1 relative">
      <label
        htmlFor={name}
        className="flex items-center gap-2 pl-2 text-sm text-neutral-300">
        <span>{label}</span>
      </label>
      <input
        id={id}
        name={name}
        inputMode="tel"
        aria-invalid={error ? true : undefined}
        className="h-12 w-full rounded-lg bg-neutral-800/60 border border-neutral-700/60 px-4 outline-none focus:border-purple-600 transition-colors"
        {...register}
        value={display}
        onChange={(e) => {
          const raw = digitsOnly(e.target.value);
          const withCountry = raw.startsWith('55') ? raw : `55${raw}`;
          setDisplay(formatBR(withCountry));
          register?.onChange?.({
            target: { name, value: `+${withCountry}` },
          } as any);
        }}
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
