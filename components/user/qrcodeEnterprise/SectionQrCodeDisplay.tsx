import CardSimple from 'components/user/shared/cards/cardSimple';
import { FaCopy, FaDownload, FaShare } from 'react-icons/fa';

interface PropsSectionQrCodeDisplay {
  enterpriseName?: string | null;
  qrCodeUrl: string;
  feedbackUrl: string;
  showCopied: boolean;
  onDownload: () => void;
  onCopyLink: () => void;
  onShare: () => void;
}

export default function SectionQrCodeDisplay({
  enterpriseName,
  qrCodeUrl,
  feedbackUrl,
  showCopied,
  onDownload,
  onCopyLink,
  onShare,
}: PropsSectionQrCodeDisplay) {
  return (
    <CardSimple>
      <div className="flex flex-col items-center space-y-8">
        <div className="relative">
          <div className="flex justify-center rounded-2xl p-6 shadow-lg">
            <img
              src={qrCodeUrl}
              alt={`QR Code para feedback - ${enterpriseName || 'Empresa'}`}
              className=""
            />
          </div>

          <div className="mt-4 text-center">
            <p className="mb-1 text-xs text-neutral-500">Link do formulário:</p>
            <p className="break-all rounded-lg bg-neutral-800/30 px-3 py-1 font-mono text-xs text-neutral-400">
              {feedbackUrl}
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-center gap-2">
          <button
            onClick={onDownload}
            className="flex items-center gap-2 rounded-lg border border-neutral-700/50 bg-neutral-800/50 px-4 py-2 text-sm text-neutral-200 transition-all duration-200 hover:border-neutral-600/50 hover:bg-neutral-700/50">
            <FaDownload className="text-xs" />
            <span>Download</span>
          </button>

          <button
            onClick={onCopyLink}
            className="relative flex items-center gap-2 rounded-lg border border-neutral-700/50 bg-neutral-800/50 px-4 py-2 text-sm text-neutral-200 transition-all duration-200 hover:border-neutral-600/50 hover:bg-neutral-700/50">
            <FaCopy className="text-xs" />
            <span>{showCopied ? 'Copiado!' : 'Copiar'}</span>
            {showCopied && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform whitespace-nowrap rounded border border-neutral-600 bg-neutral-700 px-2 py-1 text-xs text-neutral-200">
                Link copiado!
              </div>
            )}
          </button>

          <button
            onClick={onShare}
            className="flex items-center gap-2 rounded-lg border border-neutral-700/50 bg-neutral-800/50 px-4 py-2 text-sm text-neutral-200 transition-all duration-200 hover:border-neutral-600/50 hover:bg-neutral-700/50">
            <FaShare className="text-xs" />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>
    </CardSimple>
  );
}
