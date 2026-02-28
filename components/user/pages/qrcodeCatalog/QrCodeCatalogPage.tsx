import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useFetcher, useRouteLoaderData } from 'react-router-dom';
import { getQrCodeUrl } from 'lib/utils/qrcode';
import type { Enterprise } from 'lib/interfaces/entities/enterprise.entity';
import type { AuthUser } from 'lib/interfaces/entities/auth-user.entity';
import {
  INTENT_QR_DISABLE,
  INTENT_QR_ENABLE,
} from 'lib/constants/routes/intents';
import type { QrCodeCatalogLoadData } from 'src/routes/load/loadQrCodeCatalog';

type QrCodeCatalogPageProps = {
  title: string;
  subtitle: string;
  data: QrCodeCatalogLoadData;
};

type QrCatalogActionResponse = {
  ok?: boolean;
  active?: boolean;
  catalog_item_id?: string;
  collection_point_id?: string;
  error?: string;
};

type QrCatalogItemViewModel = QrCodeCatalogLoadData['items'][number] & {
  feedbackUrl: string | null;
  qrCodeUrl: string | null;
};

type QrPreviewImageProps = {
  src: string;
  alt: string;
};

const QrPreviewImage = memo(function QrPreviewImage({
  src,
  alt,
}: QrPreviewImageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;

    if (!element || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '220px',
        threshold: 0.01,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className="mb-4 flex min-h-52 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950/60 p-4"
    >
      {isVisible ? (
        <img
          src={src}
          alt={alt}
          className="h-44 w-44"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="h-44 w-44 animate-pulse rounded-lg bg-neutral-900" />
      )}
    </div>
  );
});

type QrCatalogItemCardProps = {
  item: QrCatalogItemViewModel;
  isPending: boolean;
  onToggle: (catalogItemId: string, isActive: boolean) => void;
};

const QrCatalogItemCard = memo(function QrCatalogItemCard({
  item,
  isPending,
  onToggle,
}: QrCatalogItemCardProps) {
  return (
    <article
      className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-100">{item.name}</h2>
          <p className="mt-1 text-xs text-neutral-400">
            {item.description || 'Sem descrição'}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
            item.active
              ? 'bg-emerald-500/15 text-emerald-300'
              : 'bg-neutral-700/60 text-neutral-300'
          }`}
        >
          {item.active ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {item.active && item.qrCodeUrl ? (
        <QrPreviewImage
          src={item.qrCodeUrl}
          alt={`QR Code de ${item.name}`}
        />
      ) : (
        <div className="mb-4 rounded-xl border border-dashed border-neutral-700 bg-neutral-950/40 p-4 text-center text-xs text-neutral-500">
          Ative o QR Code para gerar o link e a imagem deste item.
        </div>
      )}

      {item.active && item.feedbackUrl && (
        <div className="mb-4 rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-300 break-all">
          {item.feedbackUrl}
        </div>
      )}

      <button
        type="button"
        onClick={() => onToggle(item.catalog_item_id, item.active)}
        disabled={isPending}
        className="w-full rounded-lg border border-neutral-700 px-3 py-2 text-sm font-medium text-neutral-100 transition-colors hover:border-neutral-500 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? 'Atualizando...'
          : item.active
            ? 'Desativar QR deste item'
            : 'Ativar QR deste item'}
      </button>
    </article>
  );
});

export default function QrCodeCatalogPage({
  title,
  subtitle,
  data,
}: QrCodeCatalogPageProps) {
  const { enterprise } = useRouteLoaderData('user') as {
    enterprise: Enterprise;
    user: AuthUser['user'];
  };
  const fetcher = useFetcher<QrCatalogActionResponse>();
  const [items, setItems] = useState(data.items);
  const [pendingCatalogItemId, setPendingCatalogItemId] = useState<string | null>(null);

  useEffect(() => {
    setItems(data.items);
  }, [data.items]);

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) {
      return;
    }

    if (fetcher.data.ok && fetcher.data.catalog_item_id) {
      setItems((previousItems) =>
        previousItems.map((item) => {
          if (item.catalog_item_id !== fetcher.data?.catalog_item_id) {
            return item;
          }

          return {
            ...item,
            active: Boolean(fetcher.data?.active),
            collection_point_id:
              fetcher.data?.active
                ? (fetcher.data.collection_point_id ?? item.collection_point_id)
                : null,
          };
        }),
      );
    }

    setPendingCatalogItemId(null);
  }, [fetcher.state, fetcher.data]);

  const buildFeedbackUrl = (collectionPointId: string, catalogItemId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/feedback/qrcode?enterprise=${enterprise.id}&collection_point=${collectionPointId}&item=${catalogItemId}`;
  };

  const hasItems = items.length > 0;

  const itemsWithQrData = useMemo<QrCatalogItemViewModel[]>(
    () =>
      items.map((item) => {
        const feedbackUrl = item.collection_point_id
          ? buildFeedbackUrl(item.collection_point_id, item.catalog_item_id)
          : null;

        return {
          ...item,
          feedbackUrl,
          qrCodeUrl: feedbackUrl
            ? getQrCodeUrl(feedbackUrl, { size: 260, format: 'png' })
            : null,
        };
      }),
    [items, enterprise.id],
  );

  const handleToggle = (catalogItemId: string, isActive: boolean) => {
    setPendingCatalogItemId(catalogItemId);
    fetcher.submit(
      {
        intent: isActive ? INTENT_QR_DISABLE : INTENT_QR_ENABLE,
        catalog_item_id: catalogItemId,
      },
      { method: 'post' },
    );
  };

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
        <h1 className="text-xl font-semibold text-neutral-100">{title}</h1>
        <p className="mt-2 text-sm text-neutral-400">{subtitle}</p>
      </header>

      {data.error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {data.error}
        </div>
      )}

      {fetcher.data?.error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {fetcher.data.error}
        </div>
      )}

      {hasItems ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {itemsWithQrData.map((item) => {
            const isPending = pendingCatalogItemId === item.catalog_item_id && fetcher.state !== 'idle';

            return (
              <QrCatalogItemCard
                key={item.catalog_item_id}
                item={item}
                isPending={isPending}
                onToggle={handleToggle}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/40 p-6 text-sm text-neutral-400">
          Nenhum item ativo encontrado nessa categoria. Cadastre itens na tela de coleta para gerar QR Codes.
        </div>
      )}
    </div>
  );
}
