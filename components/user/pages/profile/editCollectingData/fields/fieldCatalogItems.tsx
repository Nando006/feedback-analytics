import { memo, useCallback, useEffect, useRef, type ChangeEvent } from 'react';
import type { CatalogItemInput } from 'lib/interfaces/entities/enterprise.entity';
import type { FieldCatalogItemsProps } from './ui.types';

const EMPTY_ITEM: CatalogItemInput = {
  name: '',
  description: '',
  status: 'ACTIVE',
};

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

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-neutral-300">Nome</label>
          <input
            type="text"
            value={item.name}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChangeField(index, 'name', event.target.value)
            }
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none transition-all placeholder:text-neutral-600 focus:border-neutral-500"
            placeholder="Ex.: Atendimento Premium"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-300">Descrição</label>
          <input
            type="text"
            value={item.description ?? ''}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChangeField(index, 'description', event.target.value)
            }
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

  const createLocalKey = useCallback(() => {
    localKeySequenceRef.current += 1;
    return `local-item-${localKeySequenceRef.current}`;
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      localKeysRef.current = [];
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
  }, [items.length, createLocalKey]);

  const handleAddItem = useCallback(() => {
    localKeysRef.current = [...localKeysRef.current, createLocalKey()];
    onChange((previousItems) => [
      ...previousItems,
      { ...EMPTY_ITEM, sort_order: previousItems.length },
    ]);
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
          {items.map((item, index) => (
            <CatalogItemRow
              key={item.id ?? localKeysRef.current[index] ?? `${title}-${index}`}
              index={index}
              item={item}
              onRemove={handleRemoveItem}
              onChangeField={handleChangeField}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default FieldCatalogItems;
