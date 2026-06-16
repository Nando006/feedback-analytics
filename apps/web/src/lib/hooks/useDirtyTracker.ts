import { useCallback, useRef, useState } from 'react';

/**
 * Replacer que ordena as chaves de objetos para uma serialização ESTÁVEL
 * (independente da ordem de inserção), evitando falsos "dirty".
 */
function sortedReplacer(_key: string, val: unknown): unknown {
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    const obj = val as Record<string, unknown>;
    return Object.keys(obj)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = obj[key];
        return acc;
      }, {});
  }
  return val;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value, sortedReplacer);
}

type DirtyTracker = {
  /** `true` quando o valor atual difere da linha de base (estado salvo). */
  isDirty: boolean;
  /** Redefine a linha de base (chame após salvar com sucesso). Sem argumento usa o valor atual. */
  markPristine: (next?: unknown) => void;
};

/**
 * Trava de "dirty" para travar o botão Salvar até existir alteração real.
 *
 * Compara `value` (estado do formulário) com uma linha de base capturada no
 * primeiro render (= estado carregado). Use `isDirty` para `disabled={!isDirty}`
 * e chame `markPristine()` quando o save concluir com sucesso, para o botão
 * voltar a ficar desabilitado sem precisar recarregar.
 *
 * A comparação é estrutural (serialização com chaves ordenadas), então funciona
 * para strings, objetos e arrays aninhados (ex.: a lista de perguntas).
 */
export function useDirtyTracker<T>(value: T): DirtyTracker {
  const [baseline, setBaseline] = useState<string>(() => stableStringify(value));
  const valueRef = useRef<T>(value);
  valueRef.current = value;

  const isDirty = stableStringify(value) !== baseline;

  const markPristine = useCallback((next?: unknown) => {
    setBaseline(stableStringify(next === undefined ? valueRef.current : next));
  }, []);

  return { isDirty, markPristine };
}
