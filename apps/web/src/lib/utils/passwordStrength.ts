export type PasswordStrength = {
  percent: number;
  label: string;
  color: string;
  showBar: boolean;
};

export function getPasswordStrength(password: string): PasswordStrength {
  const pwd = password || '';
  let score = 0;

  if (pwd.length >= 8) score += 1;
  if (/[a-z]/.test(pwd)) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  const normalized = Math.min(4, score);
  const percent = (normalized / 4) * 100;

  const labelMap = ['Muito fraca', 'Fraca', 'Razoável', 'Forte', 'Muito forte'] as const;
  const colorMap = ['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-600'] as const;

  return {
    percent,
    label: labelMap[normalized],
    color: colorMap[normalized],
    showBar: pwd.length > 0,
  };
}
