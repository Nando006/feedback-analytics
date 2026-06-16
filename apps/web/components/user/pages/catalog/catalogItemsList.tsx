import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useFetcher, useLoaderData, useRouteLoaderData } from "react-router-dom";
import type {
  CatalogItem,
  CatalogItemInput,
  CollectingDataEnterprise,
} from "lib/interfaces/entities/enterprise.entity";
import type { ActionData } from "lib/interfaces/contracts/action-data.contract";
import type { QrCodeCatalogLoadData } from "src/routes/load/loadQrCodeCatalog";
import { CATALOG_KINDS } from "src/lib/constants/catalog";
import { useToast } from "components/public/forms/messages/useToast";
import HelpHint from "components/user/shared/HelpHint";
import { FaChevronRight, FaPlus, FaTrashCan } from "react-icons/fa6";
import type { CatalogItemsListProps } from "./ui.types";

function toCatalogInput(item: CatalogItem): CatalogItemInput {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? null,
    sort_order: item.sort_order,
    status: item.status ?? "ACTIVE",
  };
}

/**
 * Lista os itens de um tipo do catálogo. Cada item leva à sua tela de
 * configuração dedicada (perguntas + QR). Adicionar/remover usam o salvamento
 * em lote do catálogo; nome e descrição são editados na tela do item.
 */
export default function CatalogItemsList({ kindSlug }: CatalogItemsListProps) {
  const config = CATALOG_KINDS[kindSlug];
  const { collecting } = useRouteLoaderData("user") as {
    collecting: CollectingDataEnterprise | null;
  };
  const qrData = useLoaderData() as QrCodeCatalogLoadData;
  const toast = useToast();
  const fetcher = useFetcher<ActionData>();

  const [newName, setNewName] = useState("");

  const items = useMemo(
    () => (collecting?.[config.itemsKey] ?? []) as CatalogItem[],
    [collecting, config.itemsKey],
  );

  const activeById = useMemo(() => {
    const map = new Map<string, boolean>();
    (qrData?.items ?? []).forEach((entry) => {
      map.set(entry.catalog_item_id, entry.active);
    });
    return map;
  }, [qrData]);

  const busy = fetcher.state !== "idle";

  useEffect(() => {
    const data = fetcher.data;
    if (!data) return;
    if (data.ok) {
      toast.success("Catálogo atualizado!", data.message || "Lista salva.");
    } else {
      toast.error(
        "Erro ao salvar",
        data.message || "Tente novamente em instantes.",
      );
    }
  }, [fetcher.data, toast]);

  const submitList = useCallback(
    (nextItems: CatalogItemInput[]) => {
      fetcher.submit(
        {
          intent: config.saveIntent,
          catalog_items: JSON.stringify(nextItems),
        },
        { method: "post" },
      );
    },
    [config.saveIntent, fetcher],
  );

  const handleAdd = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed || busy) return;
    const next: CatalogItemInput[] = [
      ...items.map(toCatalogInput),
      { name: trimmed, description: null, status: "ACTIVE", sort_order: items.length },
    ];
    setNewName("");
    submitList(next);
  }, [busy, items, newName, submitList]);

  const handleRemove = useCallback(
    (id: string | undefined) => {
      if (!id || busy) return;
      const next = items
        .filter((entry) => entry.id !== id)
        .map((entry, index) => ({ ...toCatalogInput(entry), sort_order: index }));
      submitList(next);
    },
    [busy, items, submitList],
  );

  return (
    <div className="font-work-sans relative space-y-4">
      {/* Adicionar item */}
      <div className="rounded-xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-4">
        <label className="mb-1.5 block text-[13px] font-medium text-(--text-secondary)">
          Adicionar {config.singular}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAdd();
              }
            }}
            placeholder={`Nome do ${config.singular}`}
            className="w-full rounded-lg border border-(--primary-color)/20 bg-(--bg-tertiary) px-3.5 py-2.5 text-[15px] text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={busy || newName.trim().length === 0}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-(--primary-color)/30 bg-(--primary-color)/10 px-4 py-2.5 text-[13px] font-semibold text-(--primary-color) transition-colors hover:bg-(--primary-color)/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaPlus aria-hidden className="text-[0.7rem]" />
            Adicionar
          </button>
        </div>
      </div>

      {/* Legenda dos controles da lista (uma vez, não por item) */}
      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px] text-(--text-tertiary)">
          <span className="inline-flex items-center gap-1">
            Status do QR
            <HelpHint topic="itemQrStatus" />
          </span>
          <span className="inline-flex items-center gap-1">
            Remover item
            <HelpHint topic="removeCatalogItem" />
          </span>
        </div>
      )}

      {/* Lista de itens */}
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-(--quaternary-color)/16 px-4 py-8 text-center text-sm text-(--text-tertiary)">
          {config.emptyLabel} Adicione o primeiro acima.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => {
            const isActive = item.id ? activeById.get(item.id) === true : false;
            const detailPath = `/user/edit/feedback/${config.slug}/${item.id}`;

            return (
              <li
                key={item.id ?? item.name}
                className="flex items-center gap-3 rounded-xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-3 transition-colors hover:border-(--primary-color)/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-(--text-primary)">
                    {item.name || "Sem nome"}
                  </p>
                  {item.description && (
                    <p className="truncate text-[13px] text-(--text-tertiary)">
                      {item.description}
                    </p>
                  )}
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isActive
                      ? "bg-(--positive)/12 text-(--positive)"
                      : "bg-(--seventh-color) text-(--text-tertiary)"
                  }`}
                >
                  {isActive ? "QR ativo" : "QR inativo"}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  disabled={busy}
                  aria-label={`Remover ${item.name || "item"}`}
                  className="shrink-0 rounded-md p-2 text-(--text-tertiary) transition-colors hover:text-(--negative) disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaTrashCan aria-hidden className="text-sm" />
                </button>

                <Link
                  to={detailPath}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-(--primary-color)/30 bg-(--primary-color)/10 px-3.5 py-2 text-[13px] font-semibold text-(--primary-color) transition-colors hover:bg-(--primary-color)/20"
                >
                  Configurar
                  <FaChevronRight aria-hidden className="text-[0.65rem]" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {busy && (
        <div className="pointer-events-none absolute inset-0 rounded-xl border border-(--quaternary-color)/12 bg-(--bg-primary)/35 backdrop-blur-[1px]" />
      )}
    </div>
  );
}
