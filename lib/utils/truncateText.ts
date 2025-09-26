export const truncateText = (
  text: string,
  maxLength: number = 20,
): { display: string; full: string; isTruncated: boolean } => {
  if (!text) return { display: '', full: '', isTruncated: false };

  if (text.length <= maxLength) {
    return { display: text, full: text, isTruncated: false };
  }

  return {
    display: `${text.slice(0, maxLength)}...`,
    full: text,
    isTruncated: true,
  };
};

// Hook para usar com componente React (opcional)
export const useTruncatedText = (text: string, maxLength: number = 20) => {
  const result = truncateText(text, maxLength);

  return {
    ...result,
    // Props prontas para usar em span/div
    props: result.isTruncated
      ? { title: result.full, className: 'cursor-help' }
      : {},
  };
};
