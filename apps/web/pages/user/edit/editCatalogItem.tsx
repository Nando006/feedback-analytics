import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useFetcher,
  useLoaderData,
  useParams,
  useRouteLoaderData,
} from "react-router-dom";
import type {
  CatalogItem,
  CompanyFeedbackQuestionInput,
  EnterpriseContext,
  CollectingDataEnterprise,
} from "lib/interfaces/entities/enterprise.entity";
import type { ActionData } from "lib/interfaces/contracts/action-data.contract";
import type { QrCodeCatalogLoadData } from "src/routes/load/loadQrCodeCatalog";
import type { QrCatalogActionResponse } from "components/user/pages/qrcodeCatalog/ui.types";
import {
  INTENT_QR_DISABLE,
  INTENT_QR_ENABLE,
  INTENT_QR_SAVE_FEEDBACK_QUESTIONS,
} from "src/lib/constants/routes/intents";
import { getCatalogKindBySlug } from "src/lib/constants/catalog";
import { getQrCodeUrl } from "src/lib/utils/qrcode";
import { useToast } from "components/public/forms/messages/useToast";
import PageHeader from "components/user/shared/PageHeader";
import CardSimple from "components/user/shared/cards/cardSimple";
import QuestionsEditor from "components/user/pages/profile/questionsDinamic/questionsEditor";
import SectionQrHeader from "components/user/pages/qrcodeEnterprise/SectionQrHeader";
import SectionQrInstructions from "components/user/pages/qrcodeEnterprise/SectionQrInstructions";
import SectionQrCodeDisplay from "components/user/pages/qrcodeEnterprise/SectionQrCodeDisplay";
import SectionQrUsageTips from "components/user/pages/qrcodeEnterprise/SectionQrUsageTips";

/**
 * Tela de configuração de UM item do catálogo (produto/serviço/departamento).
 * Espelha o "Feedback geral": dados do item + editor de perguntas (Editar|Prévia)
 * + QR Code próprio do item. Remonta ao trocar de item (key por itemId).
 */
export default function EditCatalogItem() {
  const { itemId } = useParams();
  return <CatalogItemConfig key={itemId ?? "novo"} />;
}

function CatalogItemConfig() {
  const params = useParams();
  const itemId = params.itemId ?? "";
  const config = getCatalogKindBySlug(params.kind);

  const qrData = useLoaderData() as QrCodeCatalogLoadData;
  const { collecting, enterprise } = useRouteLoaderData("user") as {
    collecting: CollectingDataEnterprise | null;
    enterprise: EnterpriseContext;
  };

  const toast = useToast();
  const dataFetcher = useFetcher<ActionData>();
  const qrFetcher = useFetcher<QrCatalogActionResponse>();

  const allItems = useMemo<CatalogItem[]>(
    () => (config ? ((collecting?.[config.itemsKey] ?? []) as CatalogItem[]) : []),
    [collecting, config],
  );
  const item = allItems.find((entry) => entry.id === itemId) ?? null;
  const qrItem =
    qrData?.items?.find((entry) => entry.catalog_item_id === itemId) ?? null;

  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [qrActive, setQrActive] = useState<boolean>(qrItem?.active ?? false);
  const [collectionPointId, setCollectionPointId] = useState<string | null>(
    qrItem?.collection_point_id ?? null,
  );
  const [showCopied, setShowCopied] = useState(false);
  const catalogItemsInputRef = useRef<HTMLInputElement | null>(null);

  const detailPath = config ? `/user/edit/feedback/${config.slug}/${itemId}` : "";

  useEffect(() => {
    const data = dataFetcher.data;
    if (!data) return;
    if (data.ok) {
      toast.success("Dados salvos!", data.message || "Dados do item atualizados.");
    } else {
      toast.error(
        "Erro ao salvar",
        data.message || "Tente novamente em instantes.",
      );
    }
  }, [dataFetcher.data, toast]);

  useEffect(() => {
    if (qrFetcher.state !== "idle" || !qrFetcher.data) return;
    const data = qrFetcher.data;

    if (data.error) {
      toast.error("Erro na operação", data.error);
      return;
    }

    if (data.ok && typeof data.active === "boolean") {
      setQrActive(data.active);
      setCollectionPointId((prev) =>
        data.active ? (data.collection_point_id ?? prev) : null,
      );
      toast.success(
        data.active ? "QR Code ativado!" : "QR Code desativado!",
        data.active
          ? "Item disponível para coleta de feedback."
          : "Coleta de feedback do item pausada.",
      );
    }
  }, [qrFetcher.state, qrFetcher.data, toast]);

  const handleSaveData = useCallback(() => {
    if (!config || !item) return;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const payload = allItems.map((entry) => ({
      id: entry.id,
      name: entry.id === item.id ? name.trim() : entry.name,
      description:
        entry.id === item.id
          ? description.trim()
            ? description.trim()
            : null
          : (entry.description ?? null),
      sort_order: entry.sort_order,
      status: entry.status ?? "ACTIVE",
    }));

    if (catalogItemsInputRef.current) {
      catalogItemsInputRef.current.value = JSON.stringify(payload);
    }
  }, [allItems, config, description, item, name]);

  const handleToggleQr = useCallback(() => {
    if (!detailPath) return;
    qrFetcher.submit(
      {
        intent: qrActive ? INTENT_QR_DISABLE : INTENT_QR_ENABLE,
        catalog_item_id: itemId,
      },
      { method: "post", action: detailPath },
    );
  }, [detailPath, itemId, qrActive, qrFetcher]);

  const feedbackUrl = useMemo(() => {
    if (!collectionPointId) return "";
    return `${window.location.origin}/feedback/qrcode?enterprise=${enterprise.id}&collection_point=${collectionPointId}&item=${itemId}`;
  }, [collectionPointId, enterprise.id, itemId]);

  const qrCodeUrl = useMemo(
    () =>
      feedbackUrl ? getQrCodeUrl(feedbackUrl, { size: 300, format: "png" }) : "",
    [feedbackUrl],
  );

  const handleDownload = useCallback(async () => {
    if (!qrCodeUrl) return;
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qrcode-${(name || "item")
        .toLowerCase()
        .replace(/\s+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("QR Code baixado!", "Download iniciado automaticamente");
    } catch (error) {
      console.error("Erro ao baixar QR Code:", error);
      toast.error("Erro no download", "Não foi possível baixar o QR Code");
    }
  }, [name, qrCodeUrl, toast]);

  const handleCopyLink = useCallback(async () => {
    if (!feedbackUrl) return;
    try {
      await navigator.clipboard.writeText(feedbackUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar link:", error);
    }
  }, [feedbackUrl]);

  const handleShare = useCallback(async () => {
    if (!feedbackUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Deixe seu feedback - ${name || "Item"}`,
          text: "Compartilhe sua experiência conosco!",
          url: feedbackUrl,
        });
      } catch (error) {
        console.error("Erro ao compartilhar:", error);
      }
    } else {
      handleCopyLink();
    }
  }, [feedbackUrl, handleCopyLink, name]);

  const initialQuestions = useMemo<CompanyFeedbackQuestionInput[]>(
    () =>
      (qrItem?.questions ?? []).map((question) => ({
        question_order: question.question_order,
        question_text: question.question_text,
        is_active: question.is_active,
        subquestions: (question.subquestions ?? []).map((subquestion) => ({
          subquestion_order: subquestion.subquestion_order,
          subquestion_text: subquestion.subquestion_text,
          is_active: subquestion.is_active,
        })),
      })),
    [qrItem],
  );

  const qrLoading = qrFetcher.state !== "idle";
  const dataSaving = dataFetcher.state !== "idle";

  if (!config || !item) {
    return (
      <div className="font-work-sans space-y-6 pb-8">
        <PageHeader
          title="Item não encontrado"
          breadcrumb={[
            { label: "Configuração da coleta" },
            { label: "Catálogo", to: "/user/edit/types-feedback" },
          ]}
        />
        <CardSimple>
          <p className="text-sm text-(--text-secondary)">
            Este item não está mais disponível.{" "}
            <Link
              to={config?.listPath ?? "/user/edit/types-feedback"}
              className="font-semibold text-(--primary-color) hover:underline"
            >
              Voltar ao catálogo
            </Link>
            .
          </p>
        </CardSimple>
      </div>
    );
  }

  const breadcrumb = [
    { label: "Configuração da coleta" },
    { label: "Catálogo", to: "/user/edit/types-feedback" },
    { label: config.plural, to: config.listPath },
    { label: item.name || "Item" },
  ];

  return (
    <div className="font-work-sans space-y-8 pb-8">
      <PageHeader
        title={item.name || `${config.plural} — item`}
        description={`Configure as perguntas e o QR Code deste ${config.singular}.`}
        breadcrumb={breadcrumb}
      />

      {/* Dados do item */}
      <section className="space-y-3">
        <div className="px-1">
          <h2 className="font-montserrat text-lg font-semibold text-(--text-primary)">
            Dados do {config.singular}
          </h2>
          <p className="mt-0.5 text-sm text-(--text-tertiary)">
            Nome e descrição usados na identificação do item.
          </p>
        </div>
        <CardSimple>
          <dataFetcher.Form
            method="post"
            action={detailPath}
            onSubmit={handleSaveData}
            className="w-full space-y-4"
          >
            <input type="hidden" name="intent" value={config.saveIntent} />
            <input
              ref={catalogItemsInputRef}
              type="hidden"
              name="catalog_items"
              defaultValue="[]"
            />

            <div>
              <label className="mb-1 block text-[13px] text-(--text-secondary)">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Atendimento Premium"
                className="w-full rounded-lg border border-(--primary-color)/20 bg-(--bg-tertiary) px-3.5 py-2.5 text-[15px] text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
              />
            </div>

            <div>
              <label className="mb-1 block text-[13px] text-(--text-secondary)">
                Descrição (opcional)
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Detalhe opcional"
                rows={4}
                className="w-full resize-y rounded-lg border border-(--primary-color)/20 bg-(--bg-tertiary) px-3.5 py-2.5 text-[15px] leading-relaxed text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
              />
            </div>

            <button
              type="submit"
              disabled={dataSaving}
              className="btn-primary font-poppins px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {dataSaving ? "Salvando..." : "Salvar dados do item"}
            </button>
          </dataFetcher.Form>
        </CardSimple>
      </section>

      {/* Perguntas do item */}
      <section className="space-y-3">
        <div className="px-1">
          <h2 className="font-montserrat text-lg font-semibold text-(--text-primary)">
            Perguntas de avaliação
          </h2>
          <p className="mt-0.5 text-sm text-(--text-tertiary)">
            Até 3 perguntas (com subperguntas opcionais) exibidas no QR Code deste
            item. Deixe em branco para usar apenas a nota.
          </p>
        </div>
        <QuestionsEditor
          initialQuestions={initialQuestions}
          allowVariableQuestionCount
          requireAllThree={false}
          action={detailPath}
          intent={INTENT_QR_SAVE_FEEDBACK_QUESTIONS}
          payloadFieldName="questions"
          extraHiddenFields={[{ name: "catalog_item_id", value: itemId }]}
          submitLabel="Salvar perguntas do item"
          successTitle="Perguntas salvas!"
          successMessage="Perguntas do item atualizadas."
          scopeType={config.kind}
          catalogItemId={itemId}
          idPrefix={`preview-${itemId}`}
        />
      </section>

      {/* QR Code do item */}
      <SectionQrHeader
        enterpriseName={item.name}
        qrActive={qrActive}
        qrLoading={qrLoading}
        qrError={null}
        onToggleQr={handleToggleQr}
        title={`QR Code do ${config.singular}`}
        subjectLabel="Item:"
      />

      <SectionQrInstructions />

      <div className="relative">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <SectionQrCodeDisplay
            enterpriseName={item.name}
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
