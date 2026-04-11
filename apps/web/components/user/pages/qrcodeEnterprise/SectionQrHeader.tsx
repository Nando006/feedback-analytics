import { memo } from 'react';
import CardSimple from 'components/user/shared/cards/cardSimple';
import type { SectionQrHeaderProps } from './ui.types';

const SectionQrHeader = memo(function SectionQrHeader({
  enterpriseName,
  qrActive,
  qrLoading,
  qrError,
  onToggleQr,
}: SectionQrHeaderProps) {
  return (
    <CardSimple type="header">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-(--text-primary)">QR Code para Feedback</h1>
        <p className="text-(--text-tertiary)">
          Gere e compartilhe seu QR Code personalizado para coletar feedback dos
          seus clientes
        </p>
        <div className="mt-2 text-sm text-(--text-tertiary)">
          <span className="font-medium text-(--text-secondary)">Empresa:</span>{' '}
          {enterpriseName || 'Sua Empresa'}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleQr}
            disabled={qrLoading}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
              qrActive
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15'
                : 'border-(--primary-color) bg-(--primary-color) text-white hover:bg-(--secondary-color)'
            } disabled:opacity-60`}>
            {qrLoading
              ? 'Atualizando…'
              : qrActive
                ? 'Desabilitar QR Code'
                : 'Habilitar QR Code'}
          </button>
          {qrError ? (
            <span className="text-xs text-rose-300">{qrError}</span>
          ) : (
            <span className="text-xs text-(--text-tertiary)">
              Status: {qrLoading ? 'Carregando…' : qrActive ? 'Ativo' : 'Inativo'}
            </span>
          )}
        </div>
      </div>
    </CardSimple>
  );
});

export default SectionQrHeader;
