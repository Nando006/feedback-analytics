export const formatPhone = (input: string): string => {
  if (!input) return '';

  // Mantém apenas dígitos
  let digits = input.replace(/\D/g, '');

  // Detecta e separa código do país +55 quando presente
  let cc = '';
  if (digits.startsWith('55')) {
    cc = '+55';
    digits = digits.slice(2);
  }

  // Normaliza excesso: mantém no máximo 11 dígitos (DDI já removido acima)
  if (digits.length > 11) {
    digits = digits.slice(-11);
  }

  // Celular: (DD) 9 9999-9999
  if (digits.length === 11) {
    const ddd = digits.slice(0, 2);
    const nine = digits.slice(2, 3);
    const first = digits.slice(3, 7);
    const last = digits.slice(7, 11);
    return `${cc ? cc + ' ' : ''}(${ddd}) ${nine} ${first}-${last}`;
  }

  // Fixo (fallback): (DD) 9999-9999
  if (digits.length === 10) {
    const ddd = digits.slice(0, 2);
    const first = digits.slice(2, 6);
    const last = digits.slice(6, 10);
    return `${cc ? cc + ' ' : ''}(${ddd}) ${first}-${last}`;
  }

  // Demais casos (parcial/inválido): retorna apenas dígitos limpos (ou DDI + dígitos)
  return `${cc ? cc + ' ' : ''}${digits}`;
};
