import { memo } from 'react';
import CardSimple from 'components/user/shared/cards/cardSimple';
import { FaCopy, FaDownload, FaShare } from 'react-icons/fa';
import type { SectionQrCodeDisplayProps } from './ui.types';

const SectionQrCodeDisplay = memo(function SectionQrCodeDisplay({
  enterpriseName,
  qrActive,
  qrCodeUrl,
  feedbackUrl,
  showCopied,
  onDownload,
  onCopyLink,
  onShare,
}: SectionQrCodeDisplayProps) {
  return (
    <CardSimple>
      <div className="flex flex-col items-center space-y-8">
        {qrActive ? (
          <>
            <div className="relative">
              <div className="flex justify-center rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-tertiary) p-6 shadow-lg">
                <img
                  src={qrCodeUrl}
                  alt={`QR Code para feedback - ${enterpriseName || 'Empresa'}`}
                  className=""
                  decoding="async"
                />
              </div>

              <div className="mt-4 text-center">
                <p className="mb-1 text-xs text-(--text-tertiary)">Link do formulário:</p>
                <p className="break-all rounded-lg border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 py-1 font-mono text-xs text-(--text-secondary)">
                  {feedbackUrl}
                </p>
              </div>
            </div>

            <div className="flex w-full items-center justify-center gap-2">
              <button
                onClick={onDownload}
                className="btn-ghost font-poppins flex items-center gap-2 px-4 py-2 text-sm">
                <FaDownload className="text-xs" />
                <span>Download</span>
              </button>

              <button
                onClick={onCopyLink}
                className="btn-ghost font-poppins relative flex items-center gap-2 px-4 py-2 text-sm">
                <FaCopy className="text-xs" />
                <span>{showCopied ? 'Copiado!' : 'Copiar'}</span>
                {showCopied && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform whitespace-nowrap rounded border border-(--quaternary-color)/14 bg-(--bg-tertiary) px-2 py-1 text-xs text-(--text-secondary)">
                    Link copiado!
                  </div>
                )}
              </button>

              <button
                onClick={onShare}
                className="btn-primary font-poppins flex items-center gap-2 px-4 py-2 text-sm">
                <FaShare className="text-xs" />
                <span>Compartilhar</span>
              </button>
            </div>
          </>
        ) : (
          <div className="w-full rounded-2xl border border-(--quaternary-color)/14 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-(--quaternary-color)/14 bg-(--bg-tertiary)">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-(--text-primary)">
              QR Code inativo no momento
            </h3>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-(--text-tertiary)">
              Para exibir e compartilhar seu QR Code de feedback, primeiro ative-o
              no botão do topo da página. Assim que ativado, o QR Code aparecerá
              aqui pronto para download e compartilhamento com seus clientes.
            </p>
          </div>
        )}
      </div>
    </CardSimple>
  );
});

export default SectionQrCodeDisplay;
