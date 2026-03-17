import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFetcher, useLoaderData, useRouteLoaderData } from 'react-router-dom';
import { getQrCodeUrl } from 'lib/utils/qrcode';
import type { Enterprise } from 'lib/interfaces/entities/enterprise.entity';
import type { AuthUser } from 'lib/interfaces/entities/auth-user.entity';
import type { LoaderQrCodeEnterprise } from 'src/routes/loaders/loaderQrCodeEnterprise';
import {
  INTENT_QR_DISABLE,
  INTENT_QR_ENABLE,
} from 'lib/constants/routes/intents';
import SectionQrHeader from 'components/user/pages/qrcodeEnterprise/SectionQrHeader';
import SectionQrInstructions from 'components/user/pages/qrcodeEnterprise/SectionQrInstructions';
import SectionQrCodeDisplay from 'components/user/pages/qrcodeEnterprise/SectionQrCodeDisplay';
import SectionQrUsageTips from 'components/user/pages/qrcodeEnterprise/SectionQrUsageTips';
import type { QrCodeEnterpriseActionResponse } from './ui.types';

export default function QRCodeEnterprise() {
  const { enterprise } = useRouteLoaderData('user') as {
    enterprise: Enterprise;
    user: AuthUser['user'];
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
  const feedbackUrl = useMemo(() => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/feedback/qrcode?enterprise=${enterprise.id}`;
  }, [enterprise.id]);

  const qrCodeUrl = useMemo(
    () =>
      getQrCodeUrl(feedbackUrl, {
        size: 300,
        format: 'png',
      }),
    [feedbackUrl],
  );

  const handleDownload = useCallback(async () => {
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
  }, [enterprise.full_name, qrCodeUrl]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(feedbackUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
    }
  }, [feedbackUrl]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Deixe seu Feedback - ${enterprise.full_name || 'Nossa Empresa'
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
  }, [enterprise.full_name, feedbackUrl, handleCopyLink]);

  const handleToggleQr = useCallback(() => {
    setQrError(null);
    qrFetcher.submit(
      { intent: qrActive ? INTENT_QR_DISABLE : INTENT_QR_ENABLE },
      { method: 'post' },
    );
  }, [qrActive, qrFetcher]);

  return (
    <div className="font-work-sans space-y-8 pb-8">
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
          qrActive={qrActive}
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
