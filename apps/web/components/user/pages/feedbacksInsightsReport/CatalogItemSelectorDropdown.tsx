import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FaChevronDown, FaCheck, FaMagnifyingGlass } from 'react-icons/fa6';
import type { InsightsCatalogItemOption } from './ui.types';

interface CatalogItemSelectorDropdownProps {
  selectedId: string;
  options: InsightsCatalogItemOption[];
  onChange: (id: string) => void;
  placeholder?: string;
}

export function CatalogItemSelectorDropdown({
  selectedId,
  options,
  onChange,
  placeholder = 'Selecionar item...',
}: CatalogItemSelectorDropdownProps) {
  const [search, setSearch] = useState('');
  const selectedItem = options.find((item) => item.id === selectedId);

  const filteredOptions = options.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DropdownMenu.Root onOpenChange={(open) => { if (!open) setSearch(''); }}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex h-9 max-w-[200px] md:max-w-[250px] cursor-pointer items-center gap-2 rounded-lg border border-(--quaternary-color)/18 bg-(--bg-secondary) px-3 text-xs font-medium text-(--text-primary) shadow-xs transition-colors hover:border-(--quaternary-color)/30 hover:bg-(--seventh-color) focus:outline-none focus:ring-1 focus:ring-(--primary-color)/40"
        >
          <span className="truncate">{selectedItem ? selectedItem.name : placeholder}</span>
          <FaChevronDown className="h-2.5 w-2.5 text-(--text-tertiary) shrink-0" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          className="z-50 min-w-[200px] max-w-[280px] overflow-hidden rounded-lg border border-(--quaternary-color)/12 bg-(--bg-secondary) shadow-lg shadow-black/40 animate-in fade-in-0 zoom-in-95 duration-100 flex flex-col"
        >
          {/* Caixa de Busca */}
          <div className="flex items-center gap-2 border-b border-(--quaternary-color)/10 px-2 py-1.5">
            <FaMagnifyingGlass className="h-3 w-3 text-(--text-tertiary) shrink-0" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-(--text-primary) outline-none placeholder:text-(--text-tertiary)"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key !== 'Escape' && e.key !== 'Tab') {
                  e.stopPropagation();
                }
              }}
            />
          </div>

          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-3 text-center text-xs text-(--text-tertiary)">
                Nenhum resultado encontrado.
              </div>
            ) : (
              filteredOptions.map((item) => {
                const isSelected = item.id === selectedId;

                return (
                  <DropdownMenu.Item
                    key={item.id}
                    onClick={() => onChange(item.id)}
                    className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs text-(--text-secondary) outline-none transition-colors hover:bg-(--seventh-color) hover:text-(--text-primary) focus:bg-(--seventh-color) focus:text-(--text-primary)"
                  >
                    <span className="truncate pr-4">{item.name}</span>
                    {isSelected && <FaCheck className="h-2.5 w-2.5 text-(--primary-color) shrink-0" />}
                  </DropdownMenu.Item>
                );
              })
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
