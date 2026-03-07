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
        className="flex items-center gap-2 pl-2 text-sm text-(--text-secondary) font-work-sans">
        <span>{label}</span>
      </label>
      <input
        id={id}
        name={name}
        inputMode="tel"
        aria-invalid={error ? true : undefined}
        className="h-12 w-full rounded-lg border border-(--quaternary-color)/18 bg-(--seventh-color) px-4 font-poppins text-(--text-primary) outline-none transition-colors hover:border-(--quaternary-color)/30 focus:border-(--primary-color)"
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
          className="font-work-sans absolute -right-1 -bottom-5 text-(--negative)/70 text-sm font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
