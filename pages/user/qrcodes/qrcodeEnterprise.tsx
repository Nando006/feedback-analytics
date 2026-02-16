import { useEffect, useState } from 'react';
import { useFetcher, useLoaderData, useRouteLoaderData } from 'react-router-dom';
import { getQrCodeUrl } from 'lib/utils/qrcode';
import CardSimple from 'components/user/shared/cards/cardSimple';
import type { PropsEnterprise } from 'lib/interfaces/entities/enterprise';
import type { PropsAuthUser } from 'lib/interfaces/entities/authUser';
import { FaDownload, FaShare, FaCopy, FaLightbulb } from 'react-icons/fa';
import type { LoaderQrCodeEnterprise } from 'src/routes/loaders/loaderQrCodeEnterprise';
import {
  INTENT_QR_DISABLE,
  INTENT_QR_ENABLE,
} from 'src/routes/constants/intents';

type QrCodeEnterpriseActionResponse = {
  ok?: boolean;
  active?: boolean;
  error?: string;
};

export default function QRCodeEnterprise() {
  const { enterprise } = useRouteLoaderData('user') as {
    enterprise: PropsEnterprise;
    user: PropsAuthUser['user'];
  };
  const qrLoaderData =
    useLoaderData<Awaited<ReturnType<typeof LoaderQrCodeEnterprise>>>();
  const qrFetcher = useFetcher<QrCodeEnterpriseActionResponse>();

  const [showCopied, setShowCopied] = useState(false);
  const [qrActive, setQrActive] = useState<boolean>(qrLoaderData?.qrActive ?? false);
  const [qrError, setQrError] = useState<string | null>(qrLoaderData?.qrError ?? null);

  const qrLoading = qrFetcher.state !== 'idle';

  useEffect(() => {
    const actionResult = qrFetcher.data;

    if (!actionResult) {
      return;
    }

    if (actionResult.error) {
      setQrError(actionResult.error);
      return;
    }

    if (actionResult.ok && typeof actionResult.active === 'boolean') {
      setQrError(null);
      setQrActive(actionResult.active);
    }
  }, [qrFetcher.data]);

  // Gera URL para formulário de feedback da empresa
  const generateFeedbackUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/feedback/qrcode?enterprise=${enterprise.id}`;
  };

  const feedbackUrl = generateFeedbackUrl();
  const qrCodeUrl = getQrCodeUrl(feedbackUrl, {
    size: 300,
    format: 'png',
  });

  const handleDownload = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-feedback-${(enterprise.full_name || 'empresa')
        .toLowerCase()
        .replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar QR Code:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(feedbackUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Deixe seu Feedback - ${
            enterprise.full_name || 'Nossa Empresa'
          }`,
          text: `Compartilhe sua experiência conosco! Acesse o formulário de feedback.`,
          url: feedbackUrl,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleToggleQr = () => {
    setQrError(null);
    qrFetcher.submit(
      { intent: qrActive ? INTENT_QR_DISABLE : INTENT_QR_ENABLE },
      { method: 'post' },
    );
  };

  return (
    <div className="font-inter space-y-8">
      {/* Header */}
      <CardSimple type="header">
        <div>
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">
            QR Code para Feedback
          </h1>
          <p className="text-neutral-400">
            Gere e compartilhe seu QR Code personalizado para coletar feedback
            dos seus clientes
          </p>
          <div className="mt-2 text-sm text-neutral-400">
            <span className="font-medium">Empresa:</span>{' '}
            {enterprise.full_name || 'Sua Empresa'}
          </div>

          {/* Toggle QR */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleQr}
              disabled={qrLoading}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                qrActive
                  ? 'border-red-600/40 bg-red-600/10 text-red-300 hover:bg-red-600/20'
                  : 'border-green-600/40 bg-green-600/10 text-green-300 hover:bg-green-600/20'
              } disabled:opacity-60`}
            >
              {qrLoading ? 'Atualizando…' : qrActive ? 'Desabilitar QR Code' : 'Habilitar QR Code'}
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

      {/* Instruções */}
      <CardSimple>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-400 font-bold text-lg">1</span>
            </div>
            <h3 className="font-semibold text-neutral-100 mb-2">
              Baixe o QR Code
            </h3>
            <p className="text-sm text-neutral-400">
              Clique em "Download" para salvar a imagem
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-400 font-bold text-lg">2</span>
            </div>
            <h3 className="font-semibold text-neutral-100 mb-2">
              Imprima ou Compartilhe
            </h3>
            <p className="text-sm text-neutral-400">
              Coloque em locais visíveis ou compartilhe digitalmente
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-400 font-bold text-lg">3</span>
            </div>
            <h3 className="font-semibold text-neutral-100 mb-2">
              Receba Feedback
            </h3>
            <p className="text-sm text-neutral-400">
              Clientes escaneiam e enviam feedback diretamente
            </p>
          </div>
        </div>
      </CardSimple>

      {/* QR Code Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Display */}
        <CardSimple>
          <div className="flex flex-col items-center space-y-8">
            {/* QR Code Container */}
            <div className="relative">
              <div className="flex justify-center rounded-2xl p-6 shadow-lg">
                <img
                  src={qrCodeUrl}
                  alt={`QR Code para feedback - ${
                    enterprise.full_name || 'Empresa'
                  }`}
                  className=""
                />
              </div>

              {/* URL Display */}
              <div className="mt-4 text-center">
                <p className="text-xs text-neutral-500 mb-1">
                  Link do formulário:
                </p>
                <p className="text-xs text-neutral-400 font-mono bg-neutral-800/30 px-3 py-1 rounded-lg break-all">
                  {feedbackUrl}
                </p>
              </div>
            </div>

            {/* Action Buttons - Redesigned */}
            <div className="flex items-center gap-2 w-full justify-center">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-200 rounded-lg transition-all duration-200 text-sm border border-neutral-700/50 hover:border-neutral-600/50">
                <FaDownload className="text-xs" />
                <span>Download</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-200 rounded-lg transition-all duration-200 text-sm border border-neutral-700/50 hover:border-neutral-600/50 relative">
                <FaCopy className="text-xs" />
                <span>{showCopied ? 'Copiado!' : 'Copiar'}</span>
                {showCopied && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-neutral-700 text-neutral-200 text-xs rounded whitespace-nowrap border border-neutral-600">
                    Link copiado!
                  </div>
                )}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-200 rounded-lg transition-all duration-200 text-sm border border-neutral-700/50 hover:border-neutral-600/50">
                <FaShare className="text-xs" />
                <span>Compartilhar</span>
              </button>
            </div>
          </div>
        </CardSimple>

        {/* Feedback Info */}
        <CardSimple>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <FaLightbulb className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-100">
                  Dicas de Uso
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-neutral-100 mb-1">
                    Locais Estratégicos
                  </h4>
                  <p className="text-sm text-neutral-400">
                    Coloque o QR Code em mesas, balcões, recepção ou áreas de
                    espera
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-neutral-100 mb-1">
                    Tamanho Adequado
                  </h4>
                  <p className="text-sm text-neutral-400">
                    Imprima em tamanho mínimo de 3x3cm para facilitar a leitura
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-neutral-100 mb-1">
                    Incentive o Uso
                  </h4>
                  <p className="text-sm text-neutral-400">
                    Adicione uma mensagem como "Sua opinião é importante!
                    Escaneie e nos conte"
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-neutral-100 mb-1">
                    Monitore Regularmente
                  </h4>
                  <p className="text-sm text-neutral-400">
                    Acompanhe os feedbacks recebidos no dashboard para melhorar
                    continuamente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardSimple>
      </div>
    </div>
  );
}
