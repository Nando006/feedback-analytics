import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SCOPE_CONFIG } from 'src/lib/constants/insightsScopes';
import { FaChevronDown, FaCheck } from 'react-icons/fa6';
import type { InsightScopeOption } from './ui.types';

interface ScopeSelectorDropdownProps {
  options: InsightScopeOption[];
  selected: InsightScopeOption;
  onChange: (scope: InsightScopeOption) => void;
}

export function ScopeSelectorDropdown({
  options,
  selected,
  onChange,
}: ScopeSelectorDropdownProps) {
  const selectedConfig = SCOPE_CONFIG[selected];
  const SelectedIcon = selectedConfig.Icon;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-(--quaternary-color)/18 bg-(--bg-secondary) px-3 text-xs font-medium text-(--text-primary) shadow-xs transition-colors hover:border-(--quaternary-color)/30 hover:bg-(--seventh-color) focus:outline-none focus:ring-1 focus:ring-(--primary-color)/40"
        >
          <SelectedIcon style={{ color: selectedConfig.color }} className="h-3.5 w-3.5 shrink-0" />
          <span>{selectedConfig.label}</span>
          <FaChevronDown className="h-2.5 w-2.5 text-(--text-tertiary) shrink-0" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          className="z-50 min-w-[160px] overflow-hidden rounded-lg border border-(--quaternary-color)/12 bg-(--bg-secondary) p-1 shadow-lg shadow-black/40 animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {options.map((scope) => {
            const config = SCOPE_CONFIG[scope];
            const Icon = config.Icon;
            const isSelected = scope === selected;

            return (
              <DropdownMenu.Item
                key={scope}
                onClick={() => onChange(scope)}
                className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs text-(--text-secondary) outline-none transition-colors hover:bg-(--seventh-color) hover:text-(--text-primary) focus:bg-(--seventh-color) focus:text-(--text-primary)"
              >
                <div className="flex items-center gap-2">
                  <Icon style={{ color: config.color }} className="h-3.5 w-3.5 shrink-0" />
                  <span>{config.label}</span>
                </div>
                {isSelected && <FaCheck className="h-2.5 w-2.5 text-(--primary-color) shrink-0" />}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
