import type { RegisterFieldDocumentProps } from '../ui.types';
import { useEffect, useState } from 'react';

import { digitsOnly } from 'lib/utils/digitsOnly';
import { formatDocumentInput } from 'lib/utils/formatDocumentInput';

export default function FieldDocument({
  id,
  name,
  label,
  docType,
  register,
  error,
}: RegisterFieldDocumentProps) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    setDisplay('');
  }, [docType]);

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
        inputMode="numeric"
        aria-invalid={error ? true : undefined}
        className="h-12 w-full rounded-lg bg-neutral-800/60 border border-neutral-700/60 px-4 outline-none focus:border-purple-600 transition-colors"
        {...register}
        value={display}
        onChange={(e) => {
          const raw = digitsOnly(e.target.value);
          const formatted = formatDocumentInput(raw, docType);
          setDisplay(formatted);
          register?.onChange?.({ target: { name, value: raw } });
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
