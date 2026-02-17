import { useEffect, useState } from 'react';
import { useFetcher, useLoaderData, useRouteLoaderData } from 'react-router-dom';
import { getQrCodeUrl } from 'lib/utils/qrcode';
import type { PropsEnterprise } from 'lib/interfaces/entities/enterprise';
import type { PropsAuthUser } from 'lib/interfaces/entities/authUser';
import type { LoaderQrCodeEnterprise } from 'src/routes/loaders/loaderQrCodeEnterprise';
import {
  INTENT_QR_DISABLE,
  INTENT_QR_ENABLE,
} from 'lib/constants/routes/intents';
import SectionQrHeader from 'components/user/qrcodeEnterprise/SectionQrHeader';
import SectionQrInstructions from 'components/user/qrcodeEnterprise/SectionQrInstructions';
import SectionQrCodeDisplay from 'components/user/qrcodeEnterprise/SectionQrCodeDisplay';
import SectionQrUsageTips from 'components/user/qrcodeEnterprise/SectionQrUsageTips';

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
      <SectionQrHeader
        enterpriseName={enterprise.full_name}
        qrActive={qrActive}
        qrLoading={qrLoading}
        qrError={qrError}
        onToggleQr={handleToggleQr}
      />

      <SectionQrInstructions />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <SectionQrCodeDisplay
          enterpriseName={enterprise.full_name}
          qrCodeUrl={qrCodeUrl}
          feedbackUrl={feedbackUrl}
          showCopied={showCopied}
          onDownload={handleDownload}
          onCopyLink={handleCopyLink}
          onShare={handleShare}
        />

        <SectionQrUsageTips />
      </div>
    </div>
  );
}
