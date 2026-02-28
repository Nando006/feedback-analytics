import { useEffect } from 'react';
import { useFetcher, useRevalidator, useRouteLoaderData } from 'react-router-dom';
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
  const revalidator = useRevalidator();

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data?.ok) {
      return;
    }

    revalidator.revalidate();
  }, [fetcher.state, fetcher.data, revalidator]);

  const buildFeedbackUrl = (collectionPointId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/feedback/qrcode?enterprise=${enterprise.id}&collection_point=${collectionPointId}`;
  };

  const handleToggle = (catalogItemId: string, isActive: boolean) => {
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

      {data.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/40 p-6 text-sm text-neutral-400">
          Nenhum item ativo encontrado nessa categoria. Cadastre itens na tela de coleta para gerar QR Codes.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {data.items.map((item) => {
            const feedbackUrl = item.collection_point_id
              ? buildFeedbackUrl(item.collection_point_id)
              : null;
            const qrCodeUrl = feedbackUrl
              ? getQrCodeUrl(feedbackUrl, { size: 260, format: 'png' })
              : null;

            return (
              <article
                key={item.catalog_item_id}
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

                {item.active && qrCodeUrl ? (
                  <div className="mb-4 flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                    <img
                      src={qrCodeUrl}
                      alt={`QR Code de ${item.name}`}
                      className="h-44 w-44"
                    />
                  </div>
                ) : (
                  <div className="mb-4 rounded-xl border border-dashed border-neutral-700 bg-neutral-950/40 p-4 text-center text-xs text-neutral-500">
                    Ative o QR Code para gerar o link e a imagem deste item.
                  </div>
                )}

                {item.active && feedbackUrl && (
                  <div className="mb-4 rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-300 break-all">
                    {feedbackUrl}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleToggle(item.catalog_item_id, item.active)}
                  disabled={fetcher.state !== 'idle'}
                  className="w-full rounded-lg border border-neutral-700 px-3 py-2 text-sm font-medium text-neutral-100 transition-colors hover:border-neutral-500 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {item.active ? 'Desativar QR deste item' : 'Ativar QR deste item'}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
