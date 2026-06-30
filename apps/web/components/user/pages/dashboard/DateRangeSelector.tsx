import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { FaChevronDown, FaCalendar, FaCheck } from 'react-icons/fa6';
import { Calendar } from '../../shared/Calendar';
import type { DatePreset } from 'src/lib/context/insightsControls.types';

const PRESET_LABELS: Record<DatePreset, string> = {
  all: 'Histórico completo',
  today: 'Hoje',
  last_7_days: 'Últimos 7 dias',
  last_30_days: 'Últimos 30 dias',
  this_month: 'Este mês',
  last_month: 'Mês passado',
  custom: 'Personalizado',
};

function parseLocalDate(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return undefined;
  const [y, m, d] = parts.map(Number);
  return new Date(y, m - 1, d);
}

function formatLocalDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return 'Selecione...';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
}

export default function DateRangeSelector() {
  const { datePreset, customStart, customEnd, setDateRange } = useInsightsControls();
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const handlePresetChange = (preset: string) => {
    if (preset === 'custom') {
      setDateRange('custom', customStart || '', customEnd || '');
    } else {
      setDateRange(preset as DatePreset);
    }
  };

  const handleStartSelect = (date: Date) => {
    const startStr = formatLocalDateISO(date);
    const currentEnd = parseLocalDate(customEnd);
    let endStr = customEnd || '';

    if (currentEnd && date > currentEnd) {
      endStr = startStr;
    }

    setDateRange('custom', startStr, endStr);
    setStartOpen(false);
  };

  const handleEndSelect = (date: Date) => {
    const endStr = formatLocalDateISO(date);
    const currentStart = parseLocalDate(customStart);
    let startStr = customStart || '';

    if (currentStart && date < currentStart) {
      startStr = endStr;
    }

    setDateRange('custom', startStr, endStr);
    setEndOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Separador visual */}
      <span className="hidden h-6 w-px bg-(--quaternary-color)/10 sm:block" />

      {/* Preset de Data Dropdown */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-(--quaternary-color)/18 bg-(--bg-secondary) px-3 text-xs font-medium text-(--text-primary) shadow-xs transition-colors hover:border-(--quaternary-color)/30 hover:bg-(--seventh-color) focus:outline-none focus:ring-1 focus:ring-(--primary-color)/40"
          >
            <FaCalendar className="h-3.5 w-3.5 text-(--text-tertiary) shrink-0" />
            <span>{PRESET_LABELS[datePreset] || 'Selecionar período...'}</span>
            <FaChevronDown className="h-2.5 w-2.5 text-(--text-tertiary) shrink-0" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={4}
            className="z-50 min-w-[170px] overflow-hidden rounded-lg border border-(--quaternary-color)/12 bg-(--bg-secondary) p-1 shadow-lg shadow-black/40 animate-in fade-in-0 zoom-in-95 duration-100"
          >
            {(Object.keys(PRESET_LABELS) as DatePreset[]).map((preset) => {
              const isSelected = preset === datePreset;

              return (
                <DropdownMenu.Item
                  key={preset}
                  onClick={() => handlePresetChange(preset)}
                  className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs text-(--text-secondary) outline-none transition-colors hover:bg-(--seventh-color) hover:text-(--text-primary) focus:bg-(--seventh-color) focus:text-(--text-primary)"
                >
                  <span>{PRESET_LABELS[preset]}</span>
                  {isSelected && <FaCheck className="h-2.5 w-2.5 text-(--primary-color) shrink-0" />}
                </DropdownMenu.Item>
              );
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Range inputs para Personalizado */}
      {datePreset === 'custom' && (
        <div className="flex items-center gap-1.5 animate-fadeIn">
          {/* Data Início */}
          <Popover.Root open={startOpen} onOpenChange={setStartOpen}>
            <Popover.Trigger asChild>
              <button
                type="button"
                className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-(--quaternary-color)/18 bg-(--bg-secondary) px-3 text-xs text-(--text-primary) shadow-xs transition-colors hover:border-(--quaternary-color)/30 hover:bg-(--seventh-color) focus:outline-none focus:ring-1 focus:ring-(--primary-color)/40"
              >
                <span className="text-(--text-secondary) font-normal">De:</span>
                <span>{formatDisplayDate(customStart)}</span>
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="start"
                sideOffset={4}
                className="z-50 overflow-hidden rounded-lg border border-(--quaternary-color)/12 bg-(--bg-secondary) shadow-lg shadow-black/40 animate-in fade-in-0 zoom-in-95 duration-100"
              >
                <Calendar
                  selectedDate={parseLocalDate(customStart)}
                  onSelect={handleStartSelect}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <span className="self-center text-[10px] font-medium uppercase tracking-wider text-(--text-tertiary)">
            até
          </span>

          {/* Data Fim */}
          <Popover.Root open={endOpen} onOpenChange={setEndOpen}>
            <Popover.Trigger asChild>
              <button
                type="button"
                className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-(--quaternary-color)/18 bg-(--bg-secondary) px-3 text-xs text-(--text-primary) shadow-xs transition-colors hover:border-(--quaternary-color)/30 hover:bg-(--seventh-color) focus:outline-none focus:ring-1 focus:ring-(--primary-color)/40"
              >
                <span className="text-(--text-secondary) font-normal">Até:</span>
                <span>{formatDisplayDate(customEnd)}</span>
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="start"
                sideOffset={4}
                className="z-50 overflow-hidden rounded-lg border border-(--quaternary-color)/12 bg-(--bg-secondary) shadow-lg shadow-black/40 animate-in fade-in-0 zoom-in-95 duration-100"
              >
                <Calendar
                  selectedDate={parseLocalDate(customEnd)}
                  onSelect={handleEndSelect}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      )}
    </div>
  );
}
