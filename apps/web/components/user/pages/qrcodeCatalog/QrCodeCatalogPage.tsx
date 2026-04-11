import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFetcher, useRouteLoaderData } from 'react-router-dom';
import { getQrCodeUrl } from 'src/lib/utils/qrcode';
import { useToast } from 'components/public/forms/messages/useToast';
import type { Enterprise } from 'lib/interfaces/entities/enterprise.entity';
import type { AuthUser } from 'lib/interfaces/entities/auth-user.entity';
import {
  INTENT_QR_DISABLE,
  INTENT_QR_ENABLE,
  INTENT_QR_SAVE_FEEDBACK_QUESTIONS,
} from 'src/lib/constants/routes/intents';
import type {
  QrCatalogQuestion,
  QrCatalogQuestionInput,
} from 'src/services/serviceCollectionPoints';
import type {
  QrCatalogActionResponse,
  QrCatalogItemCardProps,
  QrCodeCatalogPageProps,
  QrPreviewImageProps,
} from './ui.types';

const TOTAL_QUESTIONS = 3;
const TOTAL_SUBQUESTIONS = 3;
const MIN_QUESTION_LENGTH = 20;
const MAX_QUESTION_LENGTH = 150;

function createEmptySubquestion(
  subquestionOrder: 1 | 2 | 3,
): QrCatalogQuestionInput['subquestions'][number] {
  return {
    subquestion_order: subquestionOrder,
    subquestion_text: '',
    is_active: false,
  };
}

function createEmptyQuestion(
  questionOrder: 1 | 2 | 3,
): QrCatalogQuestionInput {
  return {
    question_order: questionOrder,
    question_text: '',
    is_active: false,
    subquestions: [
      createEmptySubquestion(1),
      createEmptySubquestion(2),
      createEmptySubquestion(3),
    ],
  };
}

function normalizeQuestionsDraft(
  questions: QrCatalogQuestion[] | undefined,
): QrCatalogQuestionInput[] {
  const questionByOrder = new Map<number, QrCatalogQuestion>();

  (questions ?? []).forEach((question) => {
    questionByOrder.set(question.question_order, question);
  });

  return Array.from({ length: TOTAL_QUESTIONS }, (_, index) => {
    const questionOrder = (index + 1) as 1 | 2 | 3;
    const currentQuestion = questionByOrder.get(questionOrder);

    if (!currentQuestion) {
      return createEmptyQuestion(questionOrder);
    }

    const subquestionByOrder = new Map<number, QrCatalogQuestion['subquestions'][number]>();
    (currentQuestion.subquestions ?? []).forEach((subquestion) => {
      subquestionByOrder.set(subquestion.subquestion_order, subquestion);
    });

    return {
      question_order: questionOrder,
      question_text: currentQuestion.question_text ?? '',
      is_active: currentQuestion.is_active ?? false,
      subquestions: Array.from({ length: TOTAL_SUBQUESTIONS }, (_, subIndex) => {
        const subquestionOrder = (subIndex + 1) as 1 | 2 | 3;
        const currentSubquestion = subquestionByOrder.get(subquestionOrder);

        if (!currentSubquestion) {
          return createEmptySubquestion(subquestionOrder);
        }

        return {
          subquestion_order: subquestionOrder,
          subquestion_text: currentSubquestion.subquestion_text ?? '',
          is_active: currentSubquestion.is_active ?? false,
        };
      }),
    };
  });
}

function hasAnyQuestionText(questions: QrCatalogQuestionInput[]) {
  return questions.some((question) => {
    if (String(question.question_text ?? '').trim().length > 0) {
      return true;
    }

    return (question.subquestions ?? []).some(
      (subquestion) => String(subquestion.subquestion_text ?? '').trim().length > 0,
    );
  });
}

function hasValidQuestionLength(text: string) {
  return text.length >= MIN_QUESTION_LENGTH && text.length <= MAX_QUESTION_LENGTH;
}

function validateQuestionsDraft(questions: QrCatalogQuestionInput[]) {
  if (!hasAnyQuestionText(questions)) {
    return null;
  }

  for (const question of questions) {
    const normalizedQuestionText = String(question.question_text ?? '').trim();

    if (!hasValidQuestionLength(normalizedQuestionText)) {
      return 'Cada pergunta principal deve ter entre 20 e 150 caracteres.';
    }

    if (question.is_active && normalizedQuestionText.length === 0) {
      return 'Perguntas ativas precisam ter texto válido.';
    }

    for (const subquestion of question.subquestions ?? []) {
      const normalizedSubquestionText = String(
        subquestion.subquestion_text ?? '',
      ).trim();

      if (normalizedSubquestionText.length === 0) {
        if (subquestion.is_active) {
          return 'Subperguntas ativas precisam ter texto válido.';
        }

        continue;
      }

      if (!hasValidQuestionLength(normalizedSubquestionText)) {
        return 'Cada subpergunta deve ter entre 20 e 150 caracteres.';
      }
    }
  }

  return null;
}

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
  isSavingQuestions,
  onToggle,
  onSaveQuestions,
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

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [questionsDraft, setQuestionsDraft] = useState<QrCatalogQuestionInput[]>(
    () => normalizeQuestionsDraft(item.questions),
  );

  useEffect(() => {
    if (isEditorOpen) {
      return;
    }

    setQuestionsDraft(normalizeQuestionsDraft(item.questions));
  }, [item.questions, isEditorOpen]);

  const handleQuestionTextChange = useCallback(
    (questionIndex: number, value: string) => {
      setQuestionsDraft((prev) => {
        const next = [...prev];
        const currentQuestion = next[questionIndex];

        next[questionIndex] = {
          ...currentQuestion,
          question_text: value,
        };

        return next;
      });
    },
    [],
  );

  const handleQuestionToggle = useCallback((questionIndex: number, value: boolean) => {
    setQuestionsDraft((prev) => {
      const next = [...prev];
      const currentQuestion = next[questionIndex];

      next[questionIndex] = {
        ...currentQuestion,
        is_active: value,
      };

      return next;
    });
  }, []);

  const handleSubquestionTextChange = useCallback(
    (questionIndex: number, subquestionIndex: number, value: string) => {
      setQuestionsDraft((prev) => {
        const next = [...prev];
        const currentQuestion = next[questionIndex];
        const subquestions = [...(currentQuestion.subquestions ?? [])];
        const currentSubquestion = subquestions[subquestionIndex];

        subquestions[subquestionIndex] = {
          ...currentSubquestion,
          subquestion_text: value,
        };

        next[questionIndex] = {
          ...currentQuestion,
          subquestions,
        };

        return next;
      });
    },
    [],
  );

  const handleSubquestionToggle = useCallback(
    (questionIndex: number, subquestionIndex: number, value: boolean) => {
      setQuestionsDraft((prev) => {
        const next = [...prev];
        const currentQuestion = next[questionIndex];
        const subquestions = [...(currentQuestion.subquestions ?? [])];
        const currentSubquestion = subquestions[subquestionIndex];

        subquestions[subquestionIndex] = {
          ...currentSubquestion,
          is_active: value,
        };

        next[questionIndex] = {
          ...currentQuestion,
          subquestions,
        };

        return next;
      });
    },
    [],
  );

  const handleSaveQuestions = useCallback(() => {
    const validationMessage = validateQuestionsDraft(questionsDraft);
    if (validationMessage) {
      setEditorError(validationMessage);
      return;
    }

    setEditorError(null);

    onSaveQuestions(
      item.catalog_item_id,
      questionsDraft.map((question) => ({
        question_order: question.question_order,
        question_text: String(question.question_text ?? '').trim(),
        is_active: question.is_active,
        subquestions: (question.subquestions ?? []).map((subquestion) => ({
          subquestion_order: subquestion.subquestion_order,
          subquestion_text: String(subquestion.subquestion_text ?? '').trim(),
          is_active: subquestion.is_active,
        })),
      })),
    );
  }, [item.catalog_item_id, onSaveQuestions, questionsDraft]);

  return (
    <article
      className="rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-5 glass-card"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-montserrat text-base font-semibold text-(--text-primary)">{item.name}</h2>
          <p className="mt-1 text-xs text-(--text-tertiary)">
            {item.description || 'Sem descrição'}
          </p>
        </div>
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${item.active
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
        className={`w-full rounded-lg border px-3 py-2 text-sm font-medium font-poppins transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${item.active
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

      <div className="mt-4 rounded-xl border border-(--quaternary-color)/10 bg-(--bg-tertiary) p-3">
        <button
          type="button"
          onClick={() => {
            setEditorError(null);
            setIsEditorOpen((prev) => !prev);
          }}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="text-sm font-semibold text-(--text-primary) font-work-sans">
            Configurar perguntas deste item
          </span>
          <span className="text-xs text-(--text-tertiary)">
            {isEditorOpen ? 'Ocultar' : 'Editar'}
          </span>
        </button>

        {isEditorOpen && (
          <div className="mt-3 space-y-3">
            {questionsDraft.map((question, questionIndex) => {
              const questionTextLength = String(question.question_text ?? '').trim().length;

              return (
                <div
                  key={`question-${question.question_order}`}
                  className="rounded-lg border border-(--quaternary-color)/10 bg-(--bg-secondary) p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-(--text-primary)">
                      Pergunta {question.question_order}
                    </p>
                    <label className="flex items-center gap-2 text-xs text-(--text-secondary)">
                      <input
                        type="checkbox"
                        checked={question.is_active}
                        onChange={(event) =>
                          handleQuestionToggle(questionIndex, event.target.checked)
                        }
                      />
                      Ativa
                    </label>
                  </div>

                  <input
                    type="text"
                    value={question.question_text}
                    onChange={(event) =>
                      handleQuestionTextChange(questionIndex, event.target.value)
                    }
                    maxLength={MAX_QUESTION_LENGTH}
                    placeholder="Escreva a pergunta principal (20 a 150 caracteres)"
                    className="w-full rounded-lg border border-(--quaternary-color)/14 bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
                  />

                  <p className="mt-1 text-[11px] text-(--text-tertiary)">
                    {questionTextLength}/{MAX_QUESTION_LENGTH} caracteres
                  </p>

                  <div className="mt-2 space-y-2">
                    {(question.subquestions ?? []).map((subquestion, subquestionIndex) => {
                      const subquestionTextLength = String(
                        subquestion.subquestion_text ?? '',
                      ).trim().length;

                      return (
                        <div
                          key={`subquestion-${question.question_order}-${subquestion.subquestion_order}`}
                          className="rounded-lg border border-(--quaternary-color)/10 bg-(--bg-tertiary) p-2"
                        >
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p className="text-[11px] font-semibold text-(--text-primary)">
                              Subpergunta {question.question_order}.{subquestion.subquestion_order}
                            </p>
                            <label className="flex items-center gap-2 text-[11px] text-(--text-secondary)">
                              <input
                                type="checkbox"
                                checked={subquestion.is_active}
                                onChange={(event) =>
                                  handleSubquestionToggle(
                                    questionIndex,
                                    subquestionIndex,
                                    event.target.checked,
                                  )
                                }
                              />
                              Ativa
                            </label>
                          </div>

                          <input
                            type="text"
                            value={subquestion.subquestion_text}
                            onChange={(event) =>
                              handleSubquestionTextChange(
                                questionIndex,
                                subquestionIndex,
                                event.target.value,
                              )
                            }
                            maxLength={MAX_QUESTION_LENGTH}
                            placeholder="Escreva a subpergunta (20 a 150 caracteres)"
                            className="w-full rounded-lg border border-(--quaternary-color)/14 bg-(--bg-secondary) px-3 py-2 text-xs text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
                          />

                          <p className="mt-1 text-[10px] text-(--text-tertiary)">
                            {subquestionTextLength}/{MAX_QUESTION_LENGTH} caracteres
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {editorError && (
              <p className="text-xs text-rose-300">{editorError}</p>
            )}

            <button
              type="button"
              onClick={handleSaveQuestions}
              disabled={isSavingQuestions}
              className="w-full rounded-lg border border-(--primary-color) bg-(--primary-color) px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingQuestions ? 'Salvando perguntas...' : 'Salvar perguntas deste item'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
});

export default function QrCodeCatalogPage({
  title,
  subtitle,
  data,
}: QrCodeCatalogPageProps) {
  const toast = useToast();
  const { enterprise } = useRouteLoaderData('user') as {
    enterprise: Enterprise;
    user: AuthUser['user'];
  };
  const fetcher = useFetcher<QrCatalogActionResponse>();
  const [items, setItems] = useState(data.items);
  const [pendingToggleCatalogItemId, setPendingToggleCatalogItemId] = useState<string | null>(null);
  const [pendingQuestionsCatalogItemId, setPendingQuestionsCatalogItemId] = useState<string | null>(null);

  useEffect(() => {
    setItems(data.items);
  }, [data.items]);

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) {
      return;
    }

    if (fetcher.data.ok && fetcher.data.catalog_item_id) {
      const catalogItemId = fetcher.data.catalog_item_id;

      if (fetcher.data.questionsSaved) {
        setItems((previousItems) =>
          previousItems.map((item) => {
            if (item.catalog_item_id !== catalogItemId) {
              return item;
            }

            return {
              ...item,
              questions: fetcher.data?.questions ?? item.questions,
            };
          }),
        );

        toast.success('Perguntas salvas!', 'Configuração do item atualizada');
      } else {
        const isActivating = fetcher.data.active;

        setItems((previousItems) =>
          previousItems.map((item) => {
            if (item.catalog_item_id !== catalogItemId) {
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

        if (isActivating) {
          toast.success('QR Code ativado!', 'Item disponível para feedback');
        } else {
          toast.success('QR Code desativado!', 'Item removido da coleta');
        }
      }
    } else if (fetcher.data.error) {
      toast.error('Erro na operação', fetcher.data.error);
    }

    setPendingToggleCatalogItemId(null);
    setPendingQuestionsCatalogItemId(null);
  }, [fetcher.state, fetcher.data, toast]);

  const hasItems = items.length > 0;

  const handleToggle = useCallback((catalogItemId: string, isActive: boolean) => {
    setPendingToggleCatalogItemId(catalogItemId);
    fetcher.submit(
      {
        intent: isActive ? INTENT_QR_DISABLE : INTENT_QR_ENABLE,
        catalog_item_id: catalogItemId,
      },
      { method: 'post' },
    );
  }, [fetcher]);

  const handleSaveQuestions = useCallback(
    (catalogItemId: string, questions: QrCatalogQuestionInput[]) => {
      setPendingQuestionsCatalogItemId(catalogItemId);

      fetcher.submit(
        {
          intent: INTENT_QR_SAVE_FEEDBACK_QUESTIONS,
          catalog_item_id: catalogItemId,
          questions: JSON.stringify(questions),
        },
        { method: 'post' },
      );
    },
    [fetcher],
  );

  return (
    <div className="font-work-sans space-y-6 pb-8">
      <header className="rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
        <h1 className="font-montserrat text-xl font-semibold text-(--text-primary)">{title}</h1>
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
            const isPending =
              pendingToggleCatalogItemId === item.catalog_item_id && fetcher.state !== 'idle';
            const isSavingQuestions =
              pendingQuestionsCatalogItemId === item.catalog_item_id && fetcher.state !== 'idle';

            return (
              <QrCatalogItemCard
                key={item.catalog_item_id}
                item={item}
                enterpriseId={enterprise.id}
                isPending={isPending}
                isSavingQuestions={isSavingQuestions}
                onToggle={handleToggle}
                onSaveQuestions={handleSaveQuestions}
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
