import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouteLoaderData } from 'react-router-dom';
import type { CatalogItemInput } from 'lib/interfaces/entities/enterprise.entity';
import type { Enterprise } from 'lib/interfaces/entities/enterprise.entity';
import type { CatalogItemRowProps, FieldCatalogItemsProps, QuestionAccordionProps, QrSectionProps } from './ui.types';
import type { QrCatalogQuestionInput } from 'src/services/serviceCollectionPoints';
import type { QrCodeCatalogLoadItem } from 'src/routes/load/loadQrCodeCatalog';
import { getQrCodeUrl } from 'src/lib/utils/qrcode';

const EMPTY_ITEM: CatalogItemInput = {
  name: '',
  description: '',
  status: 'ACTIVE',
};

const INITIAL_VISIBLE_ITEMS = 30;
const VISIBLE_ITEMS_STEP = 30;
const MIN_LEN = 20;
const MAX_LEN = 150;

/* ─────────────────── question helpers ─────────────────── */

function createEmptySub(order: 1 | 2 | 3): QrCatalogQuestionInput['subquestions'][number] {
  return { subquestion_order: order, subquestion_text: '', is_active: false };
}

function createEmptyQuestion(order: 1 | 2 | 3): QrCatalogQuestionInput {
  return {
    question_order: order,
    question_text: '',
    is_active: false,
    subquestions: [createEmptySub(1), createEmptySub(2), createEmptySub(3)],
  };
}

function normalizeQuestions(
  questions: QrCodeCatalogLoadItem['questions'] | undefined,
): QrCatalogQuestionInput[] {
  const byOrder = new Map((questions ?? []).map((q) => [q.question_order, q]));

  return ([1, 2, 3] as const).map((order) => {
    const q = byOrder.get(order);
    if (!q) return createEmptyQuestion(order);

    const subByOrder = new Map((q.subquestions ?? []).map((s) => [s.subquestion_order, s]));

    return {
      question_order: order,
      question_text: q.question_text ?? '',
      is_active: q.is_active ?? false,
      subquestions: ([1, 2, 3] as const).map((subOrder) => {
        const s = subByOrder.get(subOrder);
        return s
          ? { subquestion_order: subOrder, subquestion_text: s.subquestion_text ?? '', is_active: s.is_active ?? false }
          : createEmptySub(subOrder);
      }),
    };
  });
}

function validateQuestions(questions: QrCatalogQuestionInput[]): string | null {
  const hasAnyText = questions.some(
    (q) =>
      String(q.question_text ?? '').trim().length > 0 ||
      (q.subquestions ?? []).some((s) => String(s.subquestion_text ?? '').trim().length > 0),
  );
  if (!hasAnyText) return null;

  for (const q of questions) {
    const qText = String(q.question_text ?? '').trim();
    if (qText.length > 0 && (qText.length < MIN_LEN || qText.length > MAX_LEN)) {
      return 'Cada pergunta principal deve ter entre 20 e 150 caracteres.';
    }
    if (q.is_active && qText.length === 0) return 'Perguntas ativas precisam ter texto.';

    for (const s of q.subquestions ?? []) {
      const sText = String(s.subquestion_text ?? '').trim();
      if (sText.length === 0) {
        if (s.is_active) return 'Subperguntas ativas precisam ter texto.';
        continue;
      }
      if (sText.length < MIN_LEN || sText.length > MAX_LEN) {
        return 'Cada subpergunta deve ter entre 20 e 150 caracteres.';
      }
    }
  }
  return null;
}

/* ─────────────────── question visibility helpers ─────────────────── */

function computeVisibleQCount(questions: QrCatalogQuestionInput[]): number {
  let count = 1;
  for (let qi = 1; qi < questions.length; qi++) {
    const q = questions[qi];
    if (String(q.question_text ?? '').trim().length > 0 || q.is_active) count = qi + 1;
  }
  return count;
}

function computeVisibleSubCounts(questions: QrCatalogQuestionInput[]): [number, number, number] {
  const counts: [number, number, number] = [0, 0, 0];
  questions.forEach((q, qi) => {
    if (qi >= 3) return;
    let subCount = 0;
    (q.subquestions ?? []).forEach((s, si) => {
      if (String(s.subquestion_text ?? '').trim().length > 0 || s.is_active) subCount = si + 1;
    });
    counts[qi] = subCount;
  });
  return counts;
}

/* ─────────────────── QuestionAccordion ─────────────────── */

const QuestionAccordion = memo(function QuestionAccordion({
  qrItem,
  isSaving,
  onSave,
}: QuestionAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<QrCatalogQuestionInput[]>(() =>
    normalizeQuestions(qrItem.questions),
  );
  const [error, setError] = useState<string | null>(null);
  const [visibleQCount, setVisibleQCount] = useState(() =>
    computeVisibleQCount(normalizeQuestions(qrItem.questions)),
  );
  const [visibleSubCounts, setVisibleSubCounts] = useState<[number, number, number]>(() =>
    computeVisibleSubCounts(normalizeQuestions(qrItem.questions)),
  );

  useEffect(() => {
    if (!isOpen) {
      const normalized = normalizeQuestions(qrItem.questions);
      setDraft(normalized);
      setVisibleQCount(computeVisibleQCount(normalized));
      setVisibleSubCounts(computeVisibleSubCounts(normalized));
    }
  }, [qrItem.questions, isOpen]);

  const setQuestionText = useCallback((qi: number, value: string) => {
    setDraft((prev) => { const next = [...prev]; next[qi] = { ...next[qi], question_text: value }; return next; });
  }, []);

  const setQuestionActive = useCallback((qi: number, value: boolean) => {
    setDraft((prev) => { const next = [...prev]; next[qi] = { ...next[qi], is_active: value }; return next; });
  }, []);

  const setSubText = useCallback((qi: number, si: number, value: string) => {
    setDraft((prev) => {
      const next = [...prev];
      const subs = [...(next[qi].subquestions ?? [])];
      subs[si] = { ...subs[si], subquestion_text: value };
      next[qi] = { ...next[qi], subquestions: subs };
      return next;
    });
  }, []);

  const setSubActive = useCallback((qi: number, si: number, value: boolean) => {
    setDraft((prev) => {
      const next = [...prev];
      const subs = [...(next[qi].subquestions ?? [])];
      subs[si] = { ...subs[si], is_active: value };
      next[qi] = { ...next[qi], subquestions: subs };
      return next;
    });
  }, []);

  const addQuestion = useCallback(() => {
    setVisibleQCount((v) => Math.min(v + 1, 3));
  }, []);

  const removeLastQuestion = useCallback((currentCount: number) => {
    const qi = currentCount - 1;
    setDraft((prev) => {
      const next = [...prev];
      next[qi] = createEmptyQuestion((qi + 1) as 1 | 2 | 3);
      return next;
    });
    setVisibleSubCounts((prev) => {
      const next = [...prev] as [number, number, number];
      next[qi] = 0;
      return next;
    });
    setVisibleQCount(qi);
  }, []);

  const addSub = useCallback((qi: number) => {
    setVisibleSubCounts((prev) => {
      const next = [...prev] as [number, number, number];
      next[qi] = Math.min((next[qi] ?? 0) + 1, 3);
      return next;
    });
  }, []);

  const removeLastSub = useCallback((qi: number, currentSubs: number) => {
    const si = currentSubs - 1;
    setDraft((prev) => {
      const next = [...prev];
      const subs = [...(next[qi].subquestions ?? [])];
      subs[si] = { ...subs[si], subquestion_text: '', is_active: false };
      next[qi] = { ...next[qi], subquestions: subs };
      return next;
    });
    setVisibleSubCounts((prev) => {
      const next = [...prev] as [number, number, number];
      next[qi] = si;
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    const err = validateQuestions(draft);
    if (err) { setError(err); return; }
    setError(null);
    onSave(
      qrItem.catalog_item_id,
      draft.map((q) => ({
        question_order: q.question_order,
        question_text: String(q.question_text ?? '').trim(),
        is_active: q.is_active,
        subquestions: (q.subquestions ?? []).map((s) => ({
          subquestion_order: s.subquestion_order,
          subquestion_text: String(s.subquestion_text ?? '').trim(),
          is_active: s.is_active,
        })),
      })),
    );
  }, [draft, qrItem.catalog_item_id, onSave]);

  const activeCount = draft.filter((q) => q.is_active).length;

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-(--quaternary-color)/10 bg-(--bg-secondary)">
      <button
        type="button"
        onClick={() => { setError(null); setIsOpen((v) => !v); }}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`h-3.5 w-3.5 shrink-0 text-(--text-tertiary) transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span className="text-xs font-semibold text-(--text-secondary)">Perguntas de avaliação</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-(--primary-color)/15 px-1.5 py-0.5 text-xs font-semibold text-(--primary-color)">
              {activeCount} ativa{activeCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span className="text-xs text-(--text-tertiary)">{isOpen ? 'Fechar' : 'Configurar'}</span>
      </button>

      <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="space-y-2 border-t border-(--quaternary-color)/10 px-3 pb-3 pt-2.5">

            {draft.slice(0, visibleQCount).map((q, qi) => {
              const qLen = String(q.question_text ?? '').trim().length;
              const visibleSubs = visibleSubCounts[qi] ?? 0;
              const isLastQ = qi === visibleQCount - 1;

              return (
                <div key={`q-${q.question_order}`} className="space-y-1.5">
                  <div className="overflow-hidden rounded-xl border border-(--quaternary-color)/10">

                    {/* Question header */}
                    <div className="flex items-center gap-2 bg-(--bg-tertiary)/80 px-3 py-2">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--primary-color)/20 text-[10px] font-bold text-(--primary-color)">
                        {q.question_order}
                      </div>
                      <span className="flex-1 text-xs font-semibold text-(--text-secondary)">
                        Pergunta {q.question_order}
                      </span>
                      {qi > 0 && isLastQ && (
                        <button
                          type="button"
                          onClick={() => removeLastQuestion(visibleQCount)}
                          className="mr-2 text-[10px] text-(--text-tertiary) transition-colors hover:text-rose-400"
                        >
                          remover
                        </button>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-(--text-tertiary)">Ativa</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={q.is_active}
                          onClick={() => setQuestionActive(qi, !q.is_active)}
                          className={`relative h-4 w-7 rounded-full transition-colors duration-200 focus:outline-none ${q.is_active ? 'bg-(--primary-color)' : 'bg-(--seventh-color)'}`}
                        >
                          <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${q.is_active ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    </div>

                    {/* Question body */}
                    <div className="bg-(--bg-secondary) px-3 pb-3 pt-2.5">
                      <input
                        type="text"
                        value={q.question_text}
                        onChange={(e) => setQuestionText(qi, e.target.value)}
                        maxLength={MAX_LEN}
                        placeholder="Escreva a pergunta principal (20–150 caracteres)"
                        className="w-full rounded-lg border border-(--quaternary-color)/10 bg-(--bg-tertiary) px-2.5 py-2 text-sm text-(--text-primary) outline-none transition-colors placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
                      />
                      <p className="mb-2.5 mt-0.5 text-right text-[10px] text-(--text-tertiary)">{qLen}/{MAX_LEN}</p>

                      {/* Subquestions list */}
                      {visibleSubs > 0 && (
                        <div className="mb-2.5 space-y-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-(--text-tertiary)">Subperguntas</p>
                          {(q.subquestions ?? []).slice(0, visibleSubs).map((s, si) => {
                            const sLen = String(s.subquestion_text ?? '').trim().length;
                            const isLastSub = si === visibleSubs - 1;
                            return (
                              <div key={`s-${q.question_order}-${s.subquestion_order}`} className="flex items-start gap-2">
                                <div className="mt-2.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-(--quaternary-color)/20 bg-(--bg-tertiary) text-[9px] text-(--text-tertiary)">
                                  {si + 1}
                                </div>
                                <div className="flex-1 rounded-lg border border-(--quaternary-color)/8 bg-(--bg-tertiary) px-2.5 py-2">
                                  <div className="mb-1.5 flex items-center gap-2">
                                    <span className="text-[10px] text-(--text-tertiary)">{q.question_order}.{s.subquestion_order}</span>
                                    {isLastSub && (
                                      <button
                                        type="button"
                                        onClick={() => removeLastSub(qi, visibleSubs)}
                                        className="text-[9px] text-(--text-tertiary) transition-colors hover:text-rose-400"
                                      >
                                        remover
                                      </button>
                                    )}
                                    <div className="ml-auto flex items-center gap-1.5">
                                      <span className="text-[10px] text-(--text-tertiary)">Ativa</span>
                                      <button
                                        type="button"
                                        role="switch"
                                        aria-checked={s.is_active}
                                        onClick={() => setSubActive(qi, si, !s.is_active)}
                                        className={`relative h-3.5 w-6 rounded-full transition-colors duration-200 focus:outline-none ${s.is_active ? 'bg-(--primary-color)' : 'bg-(--seventh-color)'}`}
                                      >
                                        <span className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${s.is_active ? 'translate-x-3' : 'translate-x-0.5'}`} />
                                      </button>
                                    </div>
                                  </div>
                                  <input
                                    type="text"
                                    value={s.subquestion_text}
                                    onChange={(e) => setSubText(qi, si, e.target.value)}
                                    maxLength={MAX_LEN}
                                    placeholder={`Subpergunta ${q.question_order}.${s.subquestion_order} (20–150 caracteres)`}
                                    className="w-full rounded-md border border-(--quaternary-color)/8 bg-(--bg-secondary) px-2 py-1.5 text-xs text-(--text-primary) outline-none transition-colors placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
                                  />
                                  <p className="mt-0.5 text-right text-[10px] text-(--text-tertiary)">{sLen}/{MAX_LEN}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add subquestion */}
                      {visibleSubs < 3 ? (
                        <button
                          type="button"
                          onClick={() => addSub(qi)}
                          className="flex items-center gap-1.5 text-[10px] text-(--primary-color) transition-opacity hover:opacity-75"
                        >
                          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-(--primary-color)/50 text-xs leading-none">+</span>
                          Adicionar subpergunta
                          {visibleSubs > 0 && <span className="text-(--text-tertiary)">({visibleSubs}/3)</span>}
                        </button>
                      ) : (
                        <p className="text-[10px] text-(--text-tertiary)">Limite de 3 subperguntas atingido</p>
                      )}
                    </div>
                  </div>

                  {/* Add next question */}
                  {isLastQ && visibleQCount < 3 && (
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-(--quaternary-color)/20 py-2 text-[10px] text-(--text-tertiary) transition-all hover:border-(--primary-color)/30 hover:text-(--primary-color)"
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-sm leading-none">+</span>
                      Adicionar pergunta {visibleQCount + 1}
                    </button>
                  )}
                  {isLastQ && visibleQCount === 3 && (
                    <p className="text-center text-[10px] text-(--text-tertiary)">Limite de 3 perguntas atingido</p>
                  )}
                </div>
              );
            })}

            {error && (
              <p className="rounded-md border border-rose-500/20 bg-rose-500/8 px-2.5 py-2 text-xs text-rose-300">{error}</p>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full rounded-lg border border-(--primary-color)/30 bg-(--primary-color)/10 px-3 py-2.5 text-sm font-semibold text-(--primary-color) transition-all hover:bg-(--primary-color)/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Salvando...' : 'Salvar perguntas deste item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ─────────────────── QrPreviewImage ─────────────────── */

const QrPreviewImage = memo(function QrPreviewImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { root: null, rootMargin: '200px', threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className="flex min-h-44 items-center justify-center rounded-lg border border-(--quaternary-color)/10 bg-(--bg-tertiary) p-3">
      {visible
        ? <img src={src} alt={alt} className="h-36 w-36" loading="lazy" decoding="async" />
        : <div className="h-36 w-36 animate-pulse rounded-lg bg-(--seventh-color)" />
      }
    </div>
  );
});

/* ─────────────────── QrSection ─────────────────── */

const QrSection = memo(function QrSection({ qrItem, isPending, onToggle }: QrSectionProps) {
  const { enterprise } = useRouteLoaderData('user') as { enterprise: Enterprise };

  const feedbackUrl = useMemo(() => {
    if (!qrItem.collection_point_id) return null;
    return `${window.location.origin}/feedback/qrcode?enterprise=${enterprise.id}&collection_point=${qrItem.collection_point_id}&item=${qrItem.catalog_item_id}`;
  }, [enterprise.id, qrItem.collection_point_id, qrItem.catalog_item_id]);

  const qrCodeUrl = useMemo(
    () => (feedbackUrl ? getQrCodeUrl(feedbackUrl, { size: 220, format: 'png' }) : null),
    [feedbackUrl],
  );

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-(--quaternary-color)/10 bg-(--bg-secondary)">
      {/* header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <svg className="h-3.5 w-3.5 text-(--text-tertiary)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" />
          </svg>
          <span className="text-xs font-semibold text-(--text-secondary)">QR Code</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          qrItem.active
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-(--seventh-color) text-(--text-tertiary)'
        }`}>
          {qrItem.active ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* content */}
      <div className="space-y-2.5 border-t border-(--quaternary-color)/10 px-3 pb-3 pt-2.5">
        {qrItem.active && qrCodeUrl ? (
          <>
            <QrPreviewImage src={qrCodeUrl} alt={`QR Code de ${qrItem.name}`} />
            {feedbackUrl && (
              <p className="break-all rounded-md border border-(--quaternary-color)/8 bg-(--bg-tertiary) px-2.5 py-2 text-xs leading-relaxed text-(--text-tertiary)">
                {feedbackUrl}
              </p>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-(--quaternary-color)/14 px-3 py-4 text-center">
            <p className="text-xs text-(--text-tertiary)">Ative o QR Code para gerar o link exclusivo de feedback.</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => onToggle(qrItem.catalog_item_id, qrItem.active)}
          disabled={isPending}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm font-semibold font-poppins transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
            qrItem.active
              ? 'border-rose-500/25 bg-rose-500/8 text-rose-300 hover:bg-rose-500/15'
              : 'border-(--primary-color)/40 bg-(--primary-color)/10 text-(--primary-color) hover:bg-(--primary-color)/20'
          }`}
        >
          {isPending ? 'Atualizando...' : qrItem.active ? 'Desativar QR deste item' : 'Ativar QR deste item'}
        </button>
      </div>
    </div>
  );
});

/* ─────────────────── CatalogItemRow ─────────────────── */

const CatalogItemRow = memo(function CatalogItemRow({
  index,
  item,
  onRemove,
  onChangeField,
  qrItem,
  isSavingQuestions,
  onSaveQuestions,
  isPendingToggle,
  onToggle,
}: CatalogItemRowProps) {
  const [draftName, setDraftName] = useState(item.name);
  const [draftDescription, setDraftDescription] = useState(item.description ?? '');

  useEffect(() => { setDraftName(item.name); }, [item.name]);
  useEffect(() => { setDraftDescription(item.description ?? ''); }, [item.description]);

  const handleNameBlur = () => {
    if (draftName !== item.name) onChangeField(index, 'name', draftName);
  };

  const handleDescriptionBlur = () => {
    const current = item.description ?? '';
    if (draftDescription !== current) onChangeField(index, 'description', draftDescription);
  };

  return (
    <div className="font-work-sans rounded-lg border border-(--quaternary-color)/10 bg-(--seventh-color) p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs text-(--text-tertiary)">Item {index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-xs text-red-300 transition-colors hover:text-red-200"
        >
          Remover
        </button>
      </div>

      <div className="grid gap-3">
        <div>
          <label className="mb-1 block text-xs text-(--text-secondary)">Nome</label>
          <input
            type="text" value={draftName}
            onChange={(e) => setDraftName(e.target.value)} onBlur={handleNameBlur}
            className="w-full rounded-lg border border-(--quaternary-color)/14 bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
            placeholder="Ex.: Atendimento Premium"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-(--text-secondary)">Descrição</label>
          <input
            type="text" value={draftDescription}
            onChange={(e) => setDraftDescription(e.target.value)} onBlur={handleDescriptionBlur}
            className="w-full rounded-lg border border-(--quaternary-color)/14 bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
            placeholder="Detalhe opcional"
          />
        </div>
      </div>

      {/* perguntas + qr code — somente para itens já salvos */}
      {qrItem && (
        <>
          {onSaveQuestions && (
            <QuestionAccordion
              qrItem={qrItem}
              isSaving={isSavingQuestions ?? false}
              onSave={onSaveQuestions}
            />
          )}
          {onToggle && (
            <QrSection
              qrItem={qrItem}
              isPending={isPendingToggle ?? false}
              onToggle={onToggle}
            />
          )}
        </>
      )}

      {item.id == null && (
        <p className="mt-3 text-xs text-(--text-tertiary)">
          Salve o catálogo para configurar as perguntas e o QR Code deste item.
        </p>
      )}
    </div>
  );
});

/* ─────────────────── FieldCatalogItems ─────────────────── */

const FieldCatalogItems = memo(function FieldCatalogItems({
  title,
  description,
  emptyLabel,
  items,
  onChange,
  qrItems,
  savingQuestionsItemId,
  onSaveQuestions,
  togglePendingItemId,
  onToggle,
}: FieldCatalogItemsProps) {
  const localKeySequenceRef = useRef(0);
  const localKeysRef = useRef<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(INITIAL_VISIBLE_ITEMS, items.length),
  );

  const qrByItemId = useMemo(() => {
    const map = new Map<string, QrCodeCatalogLoadItem>();
    (qrItems ?? []).forEach((qr) => map.set(qr.catalog_item_id, qr));
    return map;
  }, [qrItems]);

  const createLocalKey = useCallback(() => {
    localKeySequenceRef.current += 1;
    return `local-item-${localKeySequenceRef.current}`;
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      localKeysRef.current = [];
      setVisibleCount(0);
      return;
    }
    if (localKeysRef.current.length > items.length) {
      localKeysRef.current = localKeysRef.current.slice(0, items.length);
      return;
    }
    if (localKeysRef.current.length < items.length) {
      const missing = items.length - localKeysRef.current.length;
      localKeysRef.current = [...localKeysRef.current, ...Array.from({ length: missing }, () => createLocalKey())];
    }
    setVisibleCount((prev) => {
      const maxInitial = Math.min(INITIAL_VISIBLE_ITEMS, items.length);
      if (prev <= 0) return maxInitial;
      return Math.min(Math.max(prev, maxInitial), items.length);
    });
  }, [items.length, createLocalKey]);

  const handleAddItem = useCallback(() => {
    localKeysRef.current = [...localKeysRef.current, createLocalKey()];
    onChange((prev) => [...prev, { ...EMPTY_ITEM, sort_order: prev.length }]);
    setVisibleCount((prev) => prev + 1);
  }, [createLocalKey, onChange]);

  const handleRemoveItem = useCallback((index: number) => {
    localKeysRef.current = localKeysRef.current.filter((_, i) => i !== index);
    onChange((prev) =>
      prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, sort_order: i })),
    );
  }, [onChange]);

  const handleChangeField = useCallback((index: number, field: 'name' | 'description', value: string) => {
    onChange((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          name: field === 'name' ? value : item.name,
          description: field === 'description' ? value : (item.description ?? ''),
          sort_order: i,
          status: 'ACTIVE',
        };
      }),
    );
  }, [onChange]);

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hiddenCount = items.length - visibleItems.length;

  const handleShowMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + VISIBLE_ITEMS_STEP, items.length));
  }, [items.length]);

  return (
    <div className="font-work-sans rounded-xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-(--text-primary)">{title}</h3>
          <p className="mt-1 text-xs text-(--text-tertiary)">{description}</p>
        </div>
        <button type="button" onClick={handleAddItem} className="btn-ghost font-poppins px-3 py-2 text-xs">
          Adicionar
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-(--quaternary-color)/14 px-3 py-4 text-xs text-(--text-tertiary)">
          {emptyLabel}
        </p>
      ) : (
        <div className="space-y-3">
          {visibleItems.map((item, index) => {
            const qrItem = item.id ? qrByItemId.get(item.id) : undefined;
            return (
              <CatalogItemRow
                key={item.id ?? localKeysRef.current[index] ?? `${title}-${index}`}
                index={index}
                item={item}
                onRemove={handleRemoveItem}
                onChangeField={handleChangeField}
                qrItem={qrItem}
                isSavingQuestions={qrItem != null && savingQuestionsItemId === qrItem.catalog_item_id}
                onSaveQuestions={onSaveQuestions}
                isPendingToggle={qrItem != null && togglePendingItemId === qrItem.catalog_item_id}
                onToggle={onToggle}
              />
            );
          })}

          {hiddenCount > 0 && (
            <div className="rounded-lg border border-dashed border-(--quaternary-color)/14 bg-(--bg-secondary) p-3 text-center">
              <p className="mb-2 text-xs text-(--text-tertiary)">{hiddenCount} itens ocultos para manter a tela fluida.</p>
              <button type="button" onClick={handleShowMore} className="btn-ghost font-poppins px-3 py-2 text-xs">
                Mostrar mais {Math.min(VISIBLE_ITEMS_STEP, hiddenCount)} itens
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default FieldCatalogItems;
