import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CatalogItemInput } from 'lib/interfaces/entities/enterprise.entity';
import type { FieldCatalogItemsProps } from './ui.types';

const EMPTY_ITEM: CatalogItemInput = {
  name: '',
  description: '',
  status: 'ACTIVE',
};

const INITIAL_VISIBLE_ITEMS = 30;
const VISIBLE_ITEMS_STEP = 30;

type CatalogItemRowProps = {
  index: number;
  item: CatalogItemInput;
  onRemove: (index: number) => void;
  onChangeField: (
    index: number,
    field: 'name' | 'description',
    value: string,
  ) => void;
};

const CatalogItemRow = memo(function CatalogItemRow({
  index,
  item,
  onRemove,
  onChangeField,
}: CatalogItemRowProps) {
  const [draftName, setDraftName] = useState(item.name);
  const [draftDescription, setDraftDescription] = useState(item.description ?? '');

  useEffect(() => {
    setDraftName(item.name);
  }, [item.name]);

  useEffect(() => {
    setDraftDescription(item.description ?? '');
  }, [item.description]);

  const handleNameBlur = () => {
    if (draftName !== item.name) {
      onChangeField(index, 'name', draftName);
    }
  };

  const handleDescriptionBlur = () => {
    const currentDescription = item.description ?? '';
    if (draftDescription !== currentDescription) {
      onChangeField(index, 'description', draftDescription);
    }
  };

  return (
    <div
      className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-3"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs text-neutral-500">Item {index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-xs text-red-300 transition-colors hover:text-red-200"
        >
          Remover
        </button>
      </div>

      <div className="grid gap-3">
        <div>
          <label className="mb-1 block text-xs text-neutral-300">Nome</label>
          <input
            type="text"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={handleNameBlur}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none transition-all placeholder:text-neutral-600 focus:border-neutral-500"
            placeholder="Ex.: Atendimento Premium"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-300">Descrição</label>
          <input
            type="text"
            value={draftDescription}
            onChange={(event) => setDraftDescription(event.target.value)}
            onBlur={handleDescriptionBlur}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none transition-all placeholder:text-neutral-600 focus:border-neutral-500"
            placeholder="Detalhe opcional"
          />
        </div>
      </div>
    </div>
  );
});

const FieldCatalogItems = memo(function FieldCatalogItems({
  title,
  description,
  emptyLabel,
  items,
  onChange,
}: FieldCatalogItemsProps) {
  const localKeySequenceRef = useRef(0);
  const localKeysRef = useRef<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(INITIAL_VISIBLE_ITEMS, items.length),
  );

  const createLocalKey = useCallback(() => {
    localKeySequenceRef.current += 1;
    return `local-item-${localKeySequenceRef.current}`;
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      localKeysRef.current = [];
      setVisibleCount(0);
      return;
    }

    if (localKeysRef.current.length > items.length) {
      localKeysRef.current = localKeysRef.current.slice(0, items.length);
      return;
    }

    if (localKeysRef.current.length < items.length) {
      const missing = items.length - localKeysRef.current.length;
      const newKeys = Array.from({ length: missing }, () => createLocalKey());
      localKeysRef.current = [...localKeysRef.current, ...newKeys];
    }

    setVisibleCount((previousVisibleCount) => {
      const maxInitial = Math.min(INITIAL_VISIBLE_ITEMS, items.length);

      if (previousVisibleCount <= 0) {
        return maxInitial;
      }

      return Math.min(Math.max(previousVisibleCount, maxInitial), items.length);
    });
  }, [items.length, createLocalKey]);

  const handleAddItem = useCallback(() => {
    localKeysRef.current = [...localKeysRef.current, createLocalKey()];
    onChange((previousItems) => [
      ...previousItems,
      { ...EMPTY_ITEM, sort_order: previousItems.length },
    ]);
    setVisibleCount((previousVisibleCount) => previousVisibleCount + 1);
  }, [createLocalKey, onChange]);

  const handleRemoveItem = useCallback((index: number) => {
    localKeysRef.current = localKeysRef.current.filter(
      (_, currentIndex) => currentIndex !== index,
    );

    onChange((previousItems) =>
      previousItems
        .filter((_, currentIndex) => currentIndex !== index)
        .map((item, currentIndex) => ({
          ...item,
          sort_order: currentIndex,
        })),
    );
  }, [onChange]);

  const handleChangeField = useCallback((
    index: number,
    field: 'name' | 'description',
    value: string,
  ) => {
    onChange((previousItems) =>
      previousItems.map((item, currentIndex) => {
        if (currentIndex !== index) return item;

        const nextName = field === 'name' ? value : item.name;
        const nextDescription =
          field === 'description' ? value : (item.description ?? '');

        return {
          ...item,
          name: nextName,
          description: nextDescription,
          sort_order: currentIndex,
          status: 'ACTIVE',
        };
      }),
    );
  }, [onChange]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );

  const hiddenItemsCount = items.length - visibleItems.length;

  const handleShowMore = useCallback(() => {
    setVisibleCount((previousVisibleCount) =>
      Math.min(previousVisibleCount + VISIBLE_ITEMS_STEP, items.length),
    );
  }, [items.length]);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100">{title}</h3>
          <p className="mt-1 text-xs text-neutral-400">{description}</p>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-200 transition-colors hover:border-neutral-500 hover:bg-neutral-800"
        >
          Adicionar
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-700 px-3 py-4 text-xs text-neutral-400">
          {emptyLabel}
        </p>
      ) : (
        <div className="space-y-3">
          {visibleItems.map((item, index) => (
            <CatalogItemRow
              key={item.id ?? localKeysRef.current[index] ?? `${title}-${index}`}
              index={index}
              item={item}
              onRemove={handleRemoveItem}
              onChangeField={handleChangeField}
            />
          ))}

          {hiddenItemsCount > 0 && (
            <div className="rounded-lg border border-dashed border-neutral-700 bg-neutral-950/40 p-3 text-center">
              <p className="mb-2 text-xs text-neutral-400">
                {hiddenItemsCount} itens ocultos para manter a tela fluida.
              </p>
              <button
                type="button"
                onClick={handleShowMore}
                className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-200 transition-colors hover:border-neutral-500 hover:bg-neutral-800"
              >
                Mostrar mais {Math.min(VISIBLE_ITEMS_STEP, hiddenItemsCount)} itens
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default FieldCatalogItems;
