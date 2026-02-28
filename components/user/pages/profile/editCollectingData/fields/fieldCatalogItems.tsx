import type { ChangeEvent } from 'react';
import type { CatalogItemInput } from 'lib/interfaces/entities/enterprise.entity';
import type { FieldCatalogItemsProps } from './ui.types';

const EMPTY_ITEM: CatalogItemInput = {
  name: '',
  description: '',
  status: 'ACTIVE',
};

export default function FieldCatalogItems({
  title,
  description,
  emptyLabel,
  items,
  onChange,
}: FieldCatalogItemsProps) {
  const handleAddItem = () => {
    onChange([...items, { ...EMPTY_ITEM, sort_order: items.length }]);
  };

  const handleRemoveItem = (index: number) => {
    const nextItems = items
      .filter((_, currentIndex) => currentIndex !== index)
      .map((item, currentIndex) => ({
        ...item,
        sort_order: currentIndex,
      }));

    onChange(nextItems);
  };

  const handleChangeField = (
    index: number,
    field: 'name' | 'description',
    value: string,
  ) => {
    const nextItems: CatalogItemInput[] = items.map((item, currentIndex) => {
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
    });

    onChange(nextItems);
  };

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
            <div
              key={item.id ?? `${title}-${index}`}
              className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs text-neutral-500">Item {index + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
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
                      handleChangeField(index, 'name', event.target.value)
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
                      handleChangeField(index, 'description', event.target.value)
                    }
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none transition-all placeholder:text-neutral-600 focus:border-neutral-500"
                    placeholder="Detalhe opcional"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
