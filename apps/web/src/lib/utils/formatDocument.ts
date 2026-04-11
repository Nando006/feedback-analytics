// Função para formatar documento (CPF/CNPJ) com tipo opcional
export const formatDocument = (doc: string, docType?: 'CPF' | 'CNPJ') => {
  const digits = (doc || '').replace(/\D+/g, '');
  if (!digits) return '';

  const type =
    docType ??
    (digits.length === 14 ? 'CNPJ' : digits.length === 11 ? 'CPF' : undefined);

  if (type === 'CPF') {
    const a = digits.slice(0, 3);
    const b = digits.slice(3, 6);
    const c = digits.slice(6, 9);
    const d = digits.slice(9, 11);
    if (digits.length < 11) return digits;
    return `${a}.${b}.${c}-${d}`;
  }

  if (type === 'CNPJ') {
    const a = digits.slice(0, 2);
    const b = digits.slice(2, 5);
    const c = digits.slice(5, 8);
    const d = digits.slice(8, 12);
    const e = digits.slice(12, 14);
    if (digits.length < 14) return digits;
    return `${a}.${b}.${c}/${d}-${e}`;
  }

  return digits;
};
