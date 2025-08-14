import type { PropsField } from 'lib/interfaces/public/form/propsField';
import { useMemo, useState } from 'react';

export default function FieldPasswordRegister({
  id,
  name,
  label,
  icon,
  register,
  error,
}: PropsField) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState('');

  const strength = useMemo(() => {
    const pwd = value || '';
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    const normalized = Math.min(4, score);
    const percent = (normalized / 4) * 100;
    const labelMap = [
      'Muito fraca',
      'Fraca',
      'Razoável',
      'Forte',
      'Muito forte',
    ];
    const colorMap = [
      'bg-red-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-purple-600',
    ];
    return {
      percent,
      label: labelMap[normalized],
      color: colorMap[normalized],
      showBar: pwd.length > 0,
    };
  }, [value]);

  return (
    <div className="space-y-1 relative">
      <label
        htmlFor={name}
        className="flex items-center gap-2 pl-2 text-sm text-neutral-300">
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          autoComplete="new-password"
          className="h-12 w-full rounded-lg bg-neutral-800/60 border border-neutral-700/60 pl-4 pr-12 outline-none focus:border-purple-600 transition-colors"
          {...register}
          onChange={(e) => {
            register?.onChange?.(e);
            setValue(e.target.value);
          }}
        />
        <button
          type="button"
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-neutral-300 hover:text-neutral-100 hover:bg-neutral-700/60 focus:outline-none focus:ring-2 focus:ring-purple-600"
          onClick={() => setShow((s) => !s)}>
          {show ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5">
              <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 0 0 1.06-1.06l-2.47-2.47a12.67 12.67 0 0 0 3.19-4.41.9.9 0 0 0 0-.78C20.93 8.06 17.1 5.25 12 5.25c-1.64 0-3.18.3-4.6.86L3.53 2.47ZM12 6.75c4.31 0 7.64 2.45 9.39 5.27-.67 1.19-1.67 2.47-2.99 3.54l-2.04-2.04c.12-.4.19-.82.19-1.25a4.5 4.5 0 0 0-6.2-4.17L8.79 7.9c1-.47 2.08-.73 3.21-.73Zm-6.86 1.3 1.75 1.75A4.47 4.47 0 0 0 7.5 12a4.5 4.5 0 0 0 6.5 4.02l1.1 1.1A6.97 6.97 0 0 1 12 18.75C6.9 18.75 3.07 15.94.81 12.75a.9.9 0 0 1 0-.78C3.07 8.06 6.9 5.25 12 5.25Zm0 2.25c-3.03 0-5.61 1.55-7.41 3.75 1.8 2.2 4.38 3.75 7.41 3.75s5.61-1.55 7.41-3.75C17.61 9.05 15.03 7.5 12 7.5Zm0 1.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5">
              <path d="M12 5.25c5.1 0 8.93 2.81 11.19 6a.9.9 0 0 1 0 .78C20.93 15.94 17.1 18.75 12 18.75S3.07 15.94.81 12.75a.9.9 0 0 1 0-.78C3.07 8.06 6.9 5.25 12 5.25Zm0 2.25c-3.03 0-5.61 1.55-7.41 3.75 1.8 2.2 4.38 3.75 7.41 3.75s5.61-1.55 7.41-3.75C17.61 9.05 15.03 7.5 12 7.5Zm0 1.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
            </svg>
          )}
        </button>
      </div>
      {strength.showBar && (
        <div className="mt-2">
          <div className="w-full h-2 rounded-full overflow-hidden bg-neutral-700/60">
            <div
              className={`h-full ${strength.color}`}
              style={{ width: `${strength.percent}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] flex items-center justify-between text-neutral-400">
            <span>Força da senha</span>
            <span className="text-neutral-300">{strength.label}</span>
          </div>
        </div>
      )}
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
