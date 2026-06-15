import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFetcher, useLoaderData, useRouteLoaderData } from 'react-router-dom';
import { getQrCodeUrl } from 'src/lib/utils/qrcode';
import { useToast } from 'components/public/forms/messages/useToast';
import type { EnterpriseContext } from 'lib/interfaces/entities/enterprise.entity';
import type { LoaderFeedbackGeneral } from 'src/routes/loaders/loaderFeedbackGeneral';
import { INTENT_QR_DISABLE, INTENT_QR_ENABLE } from 'src/lib/constants/routes/intents';
import PageHeader from 'components/user/shared/PageHeader';
import QuestionDinamicEnterprise from 'components/user/pages/profile/questionsDinamic/questionDinamicEnterprise';
import SectionQrHeader from 'components/user/pages/qrcodeEnterprise/SectionQrHeader';
import SectionQrInstructions from 'components/user/pages/qrcodeEnterprise/SectionQrInstructions';
import SectionQrCodeDisplay from 'components/user/pages/qrcodeEnterprise/SectionQrCodeDisplay';
import SectionQrUsageTips from 'components/user/pages/qrcodeEnterprise/SectionQrUsageTips';
import type { QrCodeEnterpriseActionResponse } from 'pages/user/qrcodes/ui.types';

export default function EditFeedbackGeneral() {
  const { enterprise } = useRouteLoaderData('user') as {
    enterprise: EnterpriseContext;
  };
  const { qrActive: initialQrActive, qrError: initialQrError } =
    useLoaderData<Awaited<ReturnType<typeof LoaderFeedbackGeneral>>>();
  const qrFetcher = useFetcher<QrCodeEnterpriseActionResponse>();
  const toast = useToast();

  const [showCopied, setShowCopied] = useState(false);
  const [qrActive, setQrActive] = useState<boolean>(initialQrActive ?? false);
  const [qrError, setQrError] = useState<string | null>(initialQrError ?? null);

  const qrLoading = qrFetcher.state !== 'idle';

  useEffect(() => {
    const actionResult = qrFetcher.data;
    if (!actionResult) return;

    if (actionResult.error) {
      setQrError(actionResult.error);
      toast.error('Erro na operação', actionResult.error);
      return;
    }

    if (actionResult.ok && typeof actionResult.active === 'boolean') {
      setQrError(null);
      setQrActive(actionResult.active);
      toast.success(
        actionResult.active ? 'QR Code ativado!' : 'QR Code desativado!',
        actionResult.active
          ? 'Agora os clientes podem enviar feedback'
          : 'Coleta de feedback pausada',
      );
    }
  }, [qrFetcher.data, toast]);

  const feedbackUrl = useMemo(() => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/feedback/qrcode?enterprise=${enterprise.id}`;
  }, [enterprise.id]);

  const qrCodeUrl = useMemo(
    () => getQrCodeUrl(feedbackUrl, { size: 300, format: 'png' }),
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
      toast.success('QR Code baixado!', 'Download iniciado automaticamente');
    } catch (error) {
      console.error('Erro ao baixar QR Code:', error);
      toast.error('Erro no download', 'Não foi possível baixar o QR Code');
    }
  }, [enterprise.full_name, qrCodeUrl, toast]);

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
          title: `Deixe seu Feedback - ${enterprise.full_name || 'Nossa Empresa'}`,
          text: 'Compartilhe sua experiência conosco! Acesse o formulário de feedback.',
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
      <PageHeader />

      {/* Perguntas do feedback geral (escopo empresa) */}
      <section className="space-y-3">
        <div className="px-1">
          <h2 className="font-montserrat text-lg font-semibold text-(--text-primary)">
            Perguntas do feedback geral
          </h2>
          <p className="mt-0.5 text-sm text-(--text-tertiary)">
            Aparecem no formulário do QR Code geral da empresa (até 3 perguntas, com subperguntas
            opcionais). Para perguntas por produto, serviço ou departamento, use o Catálogo.
          </p>
        </div>
        <QuestionDinamicEnterprise />
      </section>

      {/* QR Code geral */}
      <SectionQrHeader
        enterpriseName={enterprise.full_name}
        qrActive={qrActive}
        qrLoading={qrLoading}
        qrError={qrError}
        onToggleQr={handleToggleQr}
      />

      <SectionQrInstructions />

      <div className="relative">
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

        {qrLoading && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-primary)/40 backdrop-blur-[1px]" />
        )}
      </div>
    </div>
  );
}
