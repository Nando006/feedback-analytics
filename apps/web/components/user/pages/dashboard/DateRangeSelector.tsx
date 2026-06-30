import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { FaChevronDown, FaCalendar, FaCheck } from 'react-icons/fa6';
import { Calendar } from '../../shared/Calendar';
import type { DatePreset } from 'src/lib/context/insightsControls.types';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';

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
  const {
    datePreset,
    customStart,
    customEnd,
    setDateRange,
    comparisonEnabled,
    setComparisonEnabled,
    comparisonReferenceType,
    setComparisonReferenceType,
    customReferenceStart,
    customReferenceEnd,
    setCustomReferenceRange,
  } = useInsightsControls();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [showInlineOptions, setShowInlineOptions] = useState(false);

  const handlePresetChange = (preset: string) => {
    if (preset === 'custom') {
      setDateRange('custom', customStart || '', customEnd || '');
    } else {
      setDateRange(preset as DatePreset);
      if (!comparisonEnabled) {
        setPickerOpen(false);
      }
    }
  };

  const handlePrimaryRangeSelect = (start: Date, end?: Date) => {
    const startStr = formatLocalDateISO(start);
    const endStr = end ? formatLocalDateISO(end) : '';
    setDateRange('custom', startStr, endStr);
  };

  const handleReferenceRangeSelect = (start: Date, end?: Date) => {
    const startStr = formatLocalDateISO(start);
    const endStr = end ? formatLocalDateISO(end) : '';
    setCustomReferenceRange(startStr, endStr);
  };

  const getReferenceLabelText = () => {
    switch (comparisonReferenceType) {
      case 'previous_year':
        return 'ano passado';
      case 'custom':
        return 'personalizado';
      case 'previous_period':
      default:
        return 'período anterior';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Separador visual */}
      <span className="hidden h-6 w-px bg-(--quaternary-color)/10 sm:block" />

      {/* Seletor Unificado Popover */}
      <Popover.Root open={pickerOpen} onOpenChange={setPickerOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-(--quaternary-color)/18 bg-(--bg-secondary) px-3 text-xs font-medium text-(--text-primary) shadow-xs transition-colors hover:border-(--quaternary-color)/30 hover:bg-(--seventh-color) focus:outline-none focus:ring-1 focus:ring-(--primary-color)/40"
          >
            <FaCalendar className="h-3.5 w-3.5 text-(--text-tertiary) shrink-0" />
            <span>{PRESET_LABELS[datePreset] || 'Selecionar período...'}</span>
            <FaChevronDown className="h-2.5 w-2.5 text-(--text-tertiary) shrink-0" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            className="z-50 max-w-[95vw] overflow-hidden rounded-xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-3 shadow-lg shadow-black/40 outline-none flex flex-col animate-in fade-in-0 zoom-in-95 duration-100"
          >
            {/* Painéis de Colunas */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Coluna 1: Presets Principais */}
              <div className="flex flex-col gap-1 min-w-[160px]">
                <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                  Período Principal
                </span>
                {(Object.keys(PRESET_LABELS) as DatePreset[]).map((preset) => {
                  const isSelected = preset === datePreset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetChange(preset)}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-left outline-none transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-(--primary-color)/10 text-(--primary-color) font-medium'
                          : 'text-(--text-secondary) hover:bg-(--seventh-color) hover:text-(--text-primary)'
                      }`}
                    >
                      <span>{PRESET_LABELS[preset]}</span>
                      {isSelected && <FaCheck className="h-2.5 w-2.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Coluna 2: Calendário Único Personalizado Principal */}
              {datePreset === 'custom' && (
                <div className="flex flex-col gap-2 border-t md:border-t-0 md:border-l border-(--quaternary-color)/12 pt-3 md:pt-0 md:pl-4">
                  <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                    Personalizar Período
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center px-2 text-xs">
                      <span className="text-(--text-secondary)">De: <span className="font-semibold text-(--text-primary)">{formatDisplayDate(customStart)}</span></span>
                      <span className="text-(--text-secondary)">Até: <span className="font-semibold text-(--text-primary)">{formatDisplayDate(customEnd)}</span></span>
                    </div>
                    <Calendar
                      isRange
                      startDate={parseLocalDate(customStart)}
                      endDate={parseLocalDate(customEnd)}
                      onRangeSelect={handlePrimaryRangeSelect}
                    />
                  </div>
                </div>
              )}

              {/* Coluna 3: Configurações de Comparação */}
              {comparisonEnabled && datePreset !== 'all' && (
                <div className="flex flex-col gap-2 border-t md:border-t-0 md:border-l border-(--quaternary-color)/12 pt-3 md:pt-0 md:pl-4">
                  <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                    Opções de Comparação
                  </span>
                  <div className="flex flex-col gap-1 min-w-[170px]">
                    <button
                      type="button"
                      onClick={() => setComparisonReferenceType('previous_period')}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs outline-none transition-colors cursor-pointer ${
                        comparisonReferenceType === 'previous_period'
                          ? 'bg-(--primary-color)/10 text-(--primary-color) font-medium'
                          : 'text-(--text-secondary) hover:bg-(--seventh-color) hover:text-(--text-primary)'
                      }`}
                    >
                      <span>Período anterior</span>
                      {comparisonReferenceType === 'previous_period' && <FaCheck className="h-2.5 w-2.5 shrink-0" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setComparisonReferenceType('previous_year')}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs outline-none transition-colors cursor-pointer ${
                        comparisonReferenceType === 'previous_year'
                          ? 'bg-(--primary-color)/10 text-(--primary-color) font-medium'
                          : 'text-(--text-secondary) hover:bg-(--seventh-color) hover:text-(--text-primary)'
                      }`}
                    >
                      <span>Mesmo período ano passado</span>
                      {comparisonReferenceType === 'previous_year' && <FaCheck className="h-2.5 w-2.5 shrink-0" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setComparisonReferenceType('custom')}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs outline-none transition-colors cursor-pointer ${
                        comparisonReferenceType === 'custom'
                          ? 'bg-(--primary-color)/10 text-(--primary-color) font-medium'
                          : 'text-(--text-secondary) hover:bg-(--seventh-color) hover:text-(--text-primary)'
                      }`}
                    >
                      <span>Personalizado</span>
                      {comparisonReferenceType === 'custom' && <FaCheck className="h-2.5 w-2.5 shrink-0" />}
                    </button>
                  </div>

                  {/* Sub-calendário Único para Comparação Personalizada */}
                  {comparisonReferenceType === 'custom' && (
                    <div className="mt-2 border-t border-(--quaternary-color)/10 pt-2 flex flex-col gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-(--text-tertiary)">Definir Referência</span>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center px-2 text-[11px]">
                          <span className="text-(--text-secondary)">De: <span className="font-semibold text-(--text-primary)">{formatDisplayDate(customReferenceStart)}</span></span>
                          <span className="text-(--text-secondary)">Até: <span className="font-semibold text-(--text-primary)">{formatDisplayDate(customReferenceEnd)}</span></span>
                        </div>
                        <Calendar
                          isRange
                          startDate={parseLocalDate(customReferenceStart)}
                          endDate={parseLocalDate(customReferenceEnd)}
                          onRangeSelect={handleReferenceRangeSelect}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Checkbox Comparar */}
      <label
        className={`flex cursor-pointer items-center gap-2 rounded-lg border border-(--quaternary-color)/18 bg-(--bg-secondary) px-3 h-9 text-xs font-medium text-(--text-primary) shadow-xs transition-colors hover:border-(--quaternary-color)/30 hover:bg-(--seventh-color) select-none ${
          datePreset === 'all' ? 'cursor-not-allowed opacity-50' : ''
        }`}
        title={datePreset === 'all' ? 'Histórico completo não suporta comparação' : undefined}
      >
        <input
          type="checkbox"
          disabled={datePreset === 'all'}
          checked={comparisonEnabled}
          onChange={(e) => setComparisonEnabled(e.target.checked)}
          className="accent-(--primary-color) h-3.5 w-3.5 cursor-pointer rounded border-(--quaternary-color)/30 bg-(--bg-primary) disabled:cursor-not-allowed"
        />
        <span>Comparar</span>
      </label>

      {/* Indicador Discreto / Opções Inline de Comparação */}
      {comparisonEnabled && datePreset !== 'all' && (
        <div className="flex items-center gap-2">
          {!showInlineOptions ? (
            <button
              type="button"
              onClick={() => setShowInlineOptions(true)}
              className="group flex items-center gap-1.5 text-xs font-medium text-(--text-secondary) hover:text-(--text-primary) transition-colors cursor-pointer select-none bg-(--bg-secondary) border border-(--quaternary-color)/18 px-3 h-9 rounded-lg shadow-xs hover:border-(--quaternary-color)/30 hover:bg-(--seventh-color)"
            >
              <ArrowLeftRight className="h-3 w-3 text-(--text-tertiary) shrink-0" />
              <span>vs. {getReferenceLabelText()}</span>
              <ChevronDown className="h-3 w-3 text-(--text-tertiary) opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
          ) : (
            <div className="flex items-center gap-1 border border-(--quaternary-color)/18 rounded-lg bg-(--bg-secondary) p-1 h-9 animate-fadeIn shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setComparisonReferenceType('previous_period');
                  setShowInlineOptions(false);
                }}
                className={`px-2.5 h-7 flex items-center text-[11px] rounded-md transition-colors cursor-pointer ${
                  comparisonReferenceType === 'previous_period'
                    ? 'bg-(--primary-color) text-white font-medium shadow-3xs'
                    : 'text-(--text-secondary) hover:bg-(--seventh-color)'
                }`}
              >
                P. anterior
              </button>
              <button
                type="button"
                onClick={() => {
                  setComparisonReferenceType('previous_year');
                  setShowInlineOptions(false);
                }}
                className={`px-2.5 h-7 flex items-center text-[11px] rounded-md transition-colors cursor-pointer ${
                  comparisonReferenceType === 'previous_year'
                    ? 'bg-(--primary-color) text-white font-medium shadow-3xs'
                    : 'text-(--text-secondary) hover:bg-(--seventh-color)'
                }`}
              >
                Ano passado
              </button>
              <button
                type="button"
                onClick={() => {
                  setComparisonReferenceType('custom');
                  setShowInlineOptions(false);
                  setPickerOpen(true);
                }}
                className={`px-2.5 h-7 flex items-center text-[11px] rounded-md transition-colors cursor-pointer ${
                  comparisonReferenceType === 'custom'
                    ? 'bg-(--primary-color) text-white font-medium shadow-3xs'
                    : 'text-(--text-secondary) hover:bg-(--seventh-color)'
                }`}
              >
                Personalizado
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
