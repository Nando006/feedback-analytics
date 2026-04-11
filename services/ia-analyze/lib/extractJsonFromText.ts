/**
 * Isola o primeiro objeto JSON valido de uma resposta textual da IA.
 * Serve para tolerar saidas com markdown ou texto adicional antes do JSON.
 */
export function extractJsonFromText(raw: string): string {
  let text = raw.trim();

  if (text.startsWith('```')) {
    const firstLineEnd = text.indexOf('\n');
    if (firstLineEnd !== -1) {
      text = text.slice(firstLineEnd + 1);
      const lastFenceIndex = text.lastIndexOf('```');
      if (lastFenceIndex !== -1) {
        text = text.slice(0, lastFenceIndex);
      }
      text = text.trim();
    }
  }

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }

  return text;
}
