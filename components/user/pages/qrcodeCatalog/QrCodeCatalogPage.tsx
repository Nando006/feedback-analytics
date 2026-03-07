import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFetcher, useRouteLoaderData } from 'react-router-dom';
import { getQrCodeUrl } from 'lib/utils/qrcode';
import type { Enterprise } from 'lib/interfaces/entities/enterprise.entity';
import type { AuthUser } from 'lib/interfaces/entities/auth-user.entity';
import {
  INTENT_QR_DISABLE,
  INTENT_QR_ENABLE,
} from 'lib/constants/routes/intents';
import type {
  QrCatalogActionResponse,
  QrCatalogItemCardProps,
  QrCodeCatalogPageProps,
  QrPreviewImageProps,
} from './ui.types';

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
      className="mb-4 flex min-h-52 items-center justify-center rounded-xl border border-(--quaternary-color)/10 bg-(--bg-tertiary) p-4"
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
        <div className="h-44 w-44 animate-pulse rounded-lg bg-(--seventh-color)" />
      )}
    </div>
  );
});

const QrCatalogItemCard = memo(function QrCatalogItemCard({
  item,
  enterpriseId,
  isPending,
  onToggle,
}: QrCatalogItemCardProps) {
  const feedbackUrl = useMemo(() => {
    if (!item.collection_point_id) {
      return null;
    }

    const baseUrl = window.location.origin;
    return `${baseUrl}/feedback/qrcode?enterprise=${enterpriseId}&collection_point=${item.collection_point_id}&item=${item.catalog_item_id}`;
  }, [enterpriseId, item.catalog_item_id, item.collection_point_id]);

  const qrCodeUrl = useMemo(
    () =>
      feedbackUrl
        ? getQrCodeUrl(feedbackUrl, { size: 260, format: 'png' })
        : null,
    [feedbackUrl],
  );

  return (
    <article
      className="rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-5 glass-card"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-(--text-primary)">{item.name}</h2>
          <p className="mt-1 text-xs text-(--text-tertiary)">
            {item.description || 'Sem descrição'}
          </p>
        </div>
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${
            item.active
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-(--quaternary-color)/14 bg-(--seventh-color) text-(--text-secondary)'
          }`}
        >
          {item.active ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {item.active && qrCodeUrl ? (
        <QrPreviewImage
          src={qrCodeUrl}
          alt={`QR Code de ${item.name}`}
        />
      ) : (
        <div className="mb-4 rounded-xl border border-dashed border-(--quaternary-color)/14 bg-(--bg-tertiary) p-4 text-center text-xs text-(--text-tertiary)">
          Ative o QR Code para gerar o link e a imagem deste item.
        </div>
      )}

      {item.active && feedbackUrl && (
        <div className="mb-4 break-all rounded-lg border border-(--quaternary-color)/14 bg-(--bg-tertiary) px-3 py-2 text-xs text-(--text-secondary)">
          {feedbackUrl}
        </div>
      )}

      <button
        type="button"
        onClick={() => onToggle(item.catalog_item_id, item.active)}
        disabled={isPending}
        className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          item.active
            ? 'border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15'
            : 'border-(--primary-color) bg-(--primary-color) text-white hover:bg-(--secondary-color)'
        }`}
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

  const hasItems = items.length > 0;

  const handleToggle = useCallback((catalogItemId: string, isActive: boolean) => {
    setPendingCatalogItemId(catalogItemId);
    fetcher.submit(
      {
        intent: isActive ? INTENT_QR_DISABLE : INTENT_QR_ENABLE,
        catalog_item_id: catalogItemId,
      },
      { method: 'post' },
    );
  }, [fetcher]);

  return (
    <div className="font-inter space-y-6 pb-8">
      <header className="rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
        <h1 className="text-xl font-semibold text-(--text-primary)">{title}</h1>
        <p className="mt-2 text-sm text-(--text-tertiary)">{subtitle}</p>
      </header>

      {data.error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {data.error}
        </div>
      )}

      {fetcher.data?.error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {fetcher.data.error}
        </div>
      )}

      {hasItems ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {items.map((item) => {
            const isPending = pendingCatalogItemId === item.catalog_item_id && fetcher.state !== 'idle';

            return (
              <QrCatalogItemCard
                key={item.catalog_item_id}
                item={item}
                enterpriseId={enterprise.id}
                isPending={isPending}
                onToggle={handleToggle}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-(--quaternary-color)/14 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 text-sm text-(--text-tertiary) glass-card">
          Nenhum item ativo encontrado nessa categoria. Cadastre itens na tela de coleta para gerar QR Codes.
        </div>
      )}
    </div>
  );
}
