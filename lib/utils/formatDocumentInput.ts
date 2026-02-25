import { digitsOnly } from './digitsOnly';

export type DocumentType = 'CPF' | 'CNPJ';

export function formatDocumentInput(raw: string, docType: DocumentType): string {
  const digits = digitsOnly(raw);

  if (docType === 'CPF') {
    const s = digits.slice(0, 11);
    return s
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
  }

  const s = digits.slice(0, 14);
  return s
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}
