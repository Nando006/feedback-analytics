import { useState } from 'react';
import type { InsightScopeOption, ScopeSelectorRadialProps } from './ui.types';
import { SCOPE_CONFIG } from 'src/lib/constants/insightsScopes';

// Leque descendente para a DIREITA (o gatilho fica encostado à esquerda da
// barra; abrir para a esquerda jogaria os círculos para fora da tela).
const SUB_POSITIONS = [
  { x: 0, y: 52 },
  { x: 44, y: 62 },
  { x: 90, y: 60 },
  { x: 132, y: 46 },
];

export function ScopeSelectorRadial({
  options,
  selected,
  onChange,
}: ScopeSelectorRadialProps) {
  const [open, setOpen] = useState(false);
  const { Icon: SelectedIcon, label: selectedLabel, color: selectedColor } =
    SCOPE_CONFIG[selected];

  const handleSelect = (scope: InsightScopeOption) => {
    onChange(scope);
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative', width: 36, height: 36 }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={selectedLabel}
        style={{
          position: 'relative',
          zIndex: 31,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: open ? '#141414' : '#2e2e2e',
          border: `2px solid ${open ? selectedColor : 'rgba(255,255,255,0.1)'}`,
          cursor: 'pointer',
          boxShadow: `0 6px 10px rgba(0,0,0,0.4), 0 0 0 0 ${selectedColor}`,
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: open ? 'scale(0.9)' : 'scale(1)',
        }}
      >
        <SelectedIcon
          style={{
            width: 14,
            height: 14,
            color: selectedColor,
            transition: '0.5s',
            transform: open ? 'rotate(45deg) scale(0.85)' : 'rotate(0deg) scale(1)',
          }}
        />
      </button>

      {/* Sub-circles */}
      {options.map((scope, i) => {
        const { label, Icon, color } = SCOPE_CONFIG[scope];
        const pos = SUB_POSITIONS[i] ?? { x: 0, y: 56 };
        const isSelected = scope === selected;
        const delay = open ? `${i * 0.07}s` : `${(options.length - 1 - i) * 0.05}s`;

        return (
          <button
            key={scope}
            type="button"
            onClick={() => handleSelect(scope)}
            title={label}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginLeft: -20,
              marginTop: -20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: isSelected ? '#0a0a0a' : '#1b1b1b',
              border: `2px solid ${isSelected ? color : 'rgba(255,255,255,0.08)'}`,
              boxShadow: isSelected
                ? `0 0 12px ${color}88, 0 6px 10px rgba(0,0,0,0.4)`
                : '0 6px 10px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 32,
              transition: open
                ? `transform 0.35s cubic-bezier(0.37,1.95,0.66,0.56) ${delay}, opacity 0.25s ease ${delay}, box-shadow 0.2s ease`
                : `transform 0.25s ease ${delay}, opacity 0.2s ease ${delay}`,
              transform: open
                ? `translate(${pos.x}px, ${pos.y}px) scale(1)`
                : 'translate(0px, 0px) scale(0.4)',
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
            }}
          >
            <Icon style={{ width: 14, height: 14, color }} />
          </button>
        );
      })}

      {/* Backdrop para fechar ao clicar fora */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 30,
          }}
        />
      )}
    </div>
  );
}
