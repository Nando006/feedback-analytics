import CardSimple from 'components/user/shared/cards/cardSimple';
import type { SectionQrHeaderProps } from './ui.types';

export default function SectionQrHeader({
  enterpriseName,
  qrActive,
  qrLoading,
  qrError,
  onToggleQr,
}: SectionQrHeaderProps) {
  return (
    <CardSimple type="header">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-neutral-100">QR Code para Feedback</h1>
        <p className="text-neutral-400">
          Gere e compartilhe seu QR Code personalizado para coletar feedback dos
          seus clientes
        </p>
        <div className="mt-2 text-sm text-neutral-400">
          <span className="font-medium">Empresa:</span> {enterpriseName || 'Sua Empresa'}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleQr}
            disabled={qrLoading}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
              qrActive
                ? 'border-red-600/40 bg-red-600/10 text-red-300 hover:bg-red-600/20'
                : 'border-green-600/40 bg-green-600/10 text-green-300 hover:bg-green-600/20'
            } disabled:opacity-60`}>
            {qrLoading
              ? 'Atualizando…'
              : qrActive
                ? 'Desabilitar QR Code'
                : 'Habilitar QR Code'}
          </button>
          {qrError ? (
            <span className="text-xs text-red-400">{qrError}</span>
          ) : (
            <span className="text-xs text-neutral-400">
              Status: {qrLoading ? 'Carregando…' : qrActive ? 'Ativo' : 'Inativo'}
            </span>
          )}
        </div>
      </div>
    </CardSimple>
  );
}
