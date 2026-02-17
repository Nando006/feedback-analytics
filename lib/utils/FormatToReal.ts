export default function FormatToCurrencyReal(value: number, options?: Intl.NumberFormatOptions) {
  return value.toLocaleString('pt-BR', options);
}