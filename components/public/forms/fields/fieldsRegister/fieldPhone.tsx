import type { FieldFormProps } from '../ui.types';
import { useState } from 'react';

import { digitsOnly } from 'lib/utils/digitsOnly';
import { formatPhoneInputBR } from 'lib/utils/formatPhoneInputBR';

export default function FieldPhoneRegister({
  id,
  name,
  label,
  register,
  error,
}: FieldFormProps) {
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
          setDisplay(formatPhoneInputBR(withCountry));
          register?.onChange?.({
            target: { name, value: `+${withCountry}` },
          });
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
