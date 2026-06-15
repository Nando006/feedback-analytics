import type { CompanyFeedbackQuestionInput } from "lib/interfaces/entities/enterprise.entity";
import type { ActionData } from "lib/interfaces/contracts/action-data.contract";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router-dom";
import { useToast } from "components/public/forms/messages/useToast";
import FeedbackFormPreview from "components/user/pages/profile/preview/feedbackFormPreview";
import {
  FaCheck,
  FaEye,
  FaPenToSquare,
  FaPlus,
  FaTrashCan,
} from "react-icons/fa6";
import type { QuestionsEditorProps } from "./ui.types";

const TOTAL_QUESTIONS = 3;
const TOTAL_SUBQUESTIONS = 3;
const MIN_QUESTION_LENGTH = 20;
const MAX_QUESTION_LENGTH = 150;

function hasValidQuestionLength(text: string) {
  return text.length >= MIN_QUESTION_LENGTH && text.length <= MAX_QUESTION_LENGTH;
}

function createEmptySub(order: 1 | 2 | 3) {
  return { subquestion_order: order, subquestion_text: "", is_active: false };
}

function createEmptyQuestion(order: 1 | 2 | 3): CompanyFeedbackQuestionInput {
  return {
    question_order: order,
    question_text: "",
    is_active: true,
    subquestions: [createEmptySub(1), createEmptySub(2), createEmptySub(3)],
  };
}

/** Garante sempre 3 perguntas, cada uma com 3 subperguntas (preenchendo o que faltar). */
function padQuestions(
  questions: CompanyFeedbackQuestionInput[],
): CompanyFeedbackQuestionInput[] {
  return Array.from({ length: TOTAL_QUESTIONS }, (_, index) => {
    const order = (index + 1) as 1 | 2 | 3;
    const q = questions[index];
    if (!q) return createEmptyQuestion(order);

    const subquestions = Array.from({ length: TOTAL_SUBQUESTIONS }, (_, si) => {
      const subOrder = (si + 1) as 1 | 2 | 3;
      const s = q.subquestions?.[si];
      return s
        ? {
            subquestion_order: subOrder,
            subquestion_text: s.subquestion_text ?? "",
            is_active: s.is_active === true,
          }
        : createEmptySub(subOrder);
    });

    return {
      question_order: order,
      question_text: q.question_text ?? "",
      is_active: q.is_active ?? true,
      subquestions,
    };
  });
}

function computeVisibleQCount(questions: CompanyFeedbackQuestionInput[]): number {
  // Conta pelo TEXTO (não pelo toggle): perguntas novas nascem ativas, então
  // contar is_active mostraria 3 perguntas vazias num item recém-criado.
  let count = 1;
  for (let qi = 1; qi < questions.length; qi++) {
    if (String(questions[qi].question_text ?? "").trim().length > 0) {
      count = qi + 1;
    }
  }
  return count;
}

function computeVisibleSubCounts(
  questions: CompanyFeedbackQuestionInput[],
): [number, number, number] {
  const counts: [number, number, number] = [0, 0, 0];
  questions.forEach((q, qi) => {
    if (qi >= 3) return;
    let subCount = 0;
    (q.subquestions ?? []).forEach((s, si) => {
      if (String(s.subquestion_text ?? "").trim().length > 0 || s.is_active) {
        subCount = si + 1;
      }
    });
    counts[qi] = subCount;
  });
  return counts;
}

function validateCompanyFeedbackQuestionInputs(
  questions: CompanyFeedbackQuestionInput[],
  visibleQCount: number,
  visibleSubCounts: [number, number, number],
  requireAllThree: boolean,
): string | null {
  const visible = questions.slice(0, visibleQCount);

  if (requireAllThree) {
    if (visible.length < TOTAL_QUESTIONS) {
      return "Defina as 3 perguntas principais.";
    }
    for (const q of visible) {
      if (!hasValidQuestionLength(String(q.question_text ?? "").trim())) {
        return "Cada pergunta principal deve ter entre 20 e 150 caracteres.";
      }
    }
  } else {
    for (const q of visible) {
      const qText = String(q.question_text ?? "").trim();
      if (qText.length > 0 && !hasValidQuestionLength(qText)) {
        return "Cada pergunta principal deve ter entre 20 e 150 caracteres.";
      }
    }
  }

  for (let qi = 0; qi < visible.length; qi++) {
    const subs = (visible[qi].subquestions ?? []).slice(
      0,
      visibleSubCounts[qi] ?? 0,
    );
    for (const s of subs) {
      const sText = String(s.subquestion_text ?? "").trim();
      if (sText.length > 0 && !hasValidQuestionLength(sText)) {
        return "Cada subpergunta deve ter entre 20 e 150 caracteres.";
      }
    }
  }

  return null;
}

function getLengthState(length: number, optional: boolean) {
  if (length === 0) {
    return {
      label: optional ? "opcional" : `0/${MAX_QUESTION_LENGTH}`,
      tone: "muted" as const,
    };
  }

  if (length < MIN_QUESTION_LENGTH) {
    return {
      label: `mín. ${MIN_QUESTION_LENGTH} · ${length}/${MAX_QUESTION_LENGTH}`,
      tone: "warn" as const,
    };
  }

  return { label: `${length}/${MAX_QUESTION_LENGTH}`, tone: "ok" as const };
}

/**
 * Editor de perguntas reutilizável — usado tanto no "Feedback geral" (escopo
 * empresa) quanto na configuração de cada item do catálogo. Mantém o mesmo
 * visual e o seletor Editar | Prévia; o comportamento (3 obrigatórias x
 * opcionais, action/intent/payload, escopo da prévia) vem por props.
 */
export default function QuestionsEditor({
  initialQuestions,
  allowVariableQuestionCount,
  requireAllThree,
  action,
  intent,
  payloadFieldName,
  extraHiddenFields = [],
  submitLabel,
  successTitle,
  successMessage,
  scopeType,
  catalogItemId = null,
  idPrefix,
}: QuestionsEditorProps) {
  const fetcher = useFetcher();
  const toast = useToast();

  const [questions, setQuestions] = useState<CompanyFeedbackQuestionInput[]>(() =>
    padQuestions(initialQuestions),
  );
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [visibleQCount, setVisibleQCount] = useState<number>(() =>
    allowVariableQuestionCount
      ? computeVisibleQCount(padQuestions(initialQuestions))
      : TOTAL_QUESTIONS,
  );
  const [visibleSubCounts, setVisibleSubCounts] = useState<
    [number, number, number]
  >(() => computeVisibleSubCounts(padQuestions(initialQuestions)));
  const payloadInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const data = fetcher.data as (ActionData & { error?: string }) | undefined;
    if (!data) return;

    if (data.ok) {
      toast.success(successTitle, data.message || successMessage);
    } else {
      toast.error(
        "Erro ao salvar",
        data.message || data.error || "Tente novamente em instantes.",
      );
    }
  }, [fetcher.data, toast, successTitle, successMessage]);

  const setQuestionActive = useCallback((qi: number, value: boolean) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qi] = { ...next[qi], is_active: value };
      return next;
    });
  }, []);

  const setQuestionText = useCallback((qi: number, value: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qi] = { ...next[qi], question_text: value };
      return next;
    });
  }, []);

  const setSubActive = useCallback((qi: number, si: number, value: boolean) => {
    setQuestions((prev) => {
      const next = [...prev];
      const subs = [...(next[qi].subquestions ?? [])];
      subs[si] = { ...subs[si], is_active: value };
      next[qi] = { ...next[qi], subquestions: subs };
      return next;
    });
  }, []);

  const setSubText = useCallback((qi: number, si: number, value: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      const subs = [...(next[qi].subquestions ?? [])];
      subs[si] = { ...subs[si], subquestion_text: value };
      next[qi] = { ...next[qi], subquestions: subs };
      return next;
    });
  }, []);

  const addQuestion = useCallback(() => {
    setVisibleQCount((v) => Math.min(v + 1, TOTAL_QUESTIONS));
  }, []);

  const removeLastQuestion = useCallback((currentCount: number) => {
    const qi = currentCount - 1;
    setQuestions((prev) => {
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
      next[qi] = Math.min((next[qi] ?? 0) + 1, TOTAL_SUBQUESTIONS);
      return next;
    });
  }, []);

  const removeLastSub = useCallback((qi: number, currentSubs: number) => {
    const si = currentSubs - 1;
    setQuestions((prev) => {
      const next = [...prev];
      const subs = [...(next[qi].subquestions ?? [])];
      subs[si] = { ...subs[si], subquestion_text: "", is_active: false };
      next[qi] = { ...next[qi], subquestions: subs };
      return next;
    });
    setVisibleSubCounts((prev) => {
      const next = [...prev] as [number, number, number];
      next[qi] = si;
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    (event: { preventDefault(): void }) => {
      const validationMessage = validateCompanyFeedbackQuestionInputs(
        questions,
        visibleQCount,
        visibleSubCounts,
        requireAllThree,
      );

      if (validationMessage) {
        event.preventDefault();
        setError(validationMessage);
        return;
      }

      setError(null);

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      if (payloadInputRef.current) {
        payloadInputRef.current.value = JSON.stringify(
          questions.map((question, index) => {
            const qText = String(question.question_text ?? "").trim();

            return {
              question_order: index + 1,
              question_text: qText,
              // Pergunta sem texto nunca é ativa; com texto, respeita o toggle.
              is_active: qText.length === 0 ? false : question.is_active !== false,
              subquestions: (question.subquestions ?? []).map(
                (subquestion, subIndex) => {
                  const sText = String(subquestion.subquestion_text ?? "").trim();

                  return {
                    subquestion_order: subIndex + 1,
                    subquestion_text: sText,
                    is_active: sText.length === 0 ? false : subquestion.is_active === true,
                  };
                },
              ),
            };
          }),
        );
      }
    },
    [questions, visibleQCount, visibleSubCounts, requireAllThree],
  );

  const renderCounter = (length: number, optional: boolean, className = "") => {
    const state = getLengthState(length, optional);
    const toneClass =
      state.tone === "ok"
        ? "text-(--positive)"
        : state.tone === "warn"
          ? "text-(--neutral)"
          : "text-(--text-tertiary)";

    return (
      <p
        className={`flex items-center justify-end gap-1 text-xs ${toneClass} ${className}`}
      >
        {state.tone === "ok" && (
          <FaCheck aria-hidden className="text-[0.65rem]" />
        )}
        {state.label}
      </p>
    );
  };

  const renderToggle = (
    checked: boolean,
    onToggle: () => void,
    ariaLabel: string,
  ) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${checked ? "bg-(--primary-color)" : "bg-(--seventh-color)"}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-[16px]" : "translate-x-0"}`}
      />
    </button>
  );

  const visibleQuestions = questions.slice(0, visibleQCount);

  return (
    <div className="relative space-y-4">
      {/* Alternância edição / prévia */}
      <div className="inline-flex rounded-lg border border-(--quaternary-color)/14 bg-(--bg-secondary) p-1">
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          aria-pressed={!showPreview}
          className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-[13px] font-semibold transition-colors ${
            showPreview
              ? "text-(--text-secondary) hover:text-(--text-primary)"
              : "bg-(--primary-color) text-(--bg-primary)"
          }`}
        >
          <FaPenToSquare aria-hidden className="text-[0.7rem]" />
          Editar
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          aria-pressed={showPreview}
          className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-[13px] font-semibold transition-colors ${
            showPreview
              ? "bg-(--primary-color) text-(--bg-primary)"
              : "text-(--text-secondary) hover:text-(--text-primary)"
          }`}
        >
          <FaEye aria-hidden className="text-[0.7rem]" />
          Prévia
        </button>
      </div>

      {showPreview ? (
        <FeedbackFormPreview
          questions={visibleQuestions}
          scopeType={scopeType}
          catalogItemId={catalogItemId}
          activeFromText={false}
          idPrefix={idPrefix}
        />
      ) : (
        <fetcher.Form
          method="post"
          action={action}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input type="hidden" name="intent" value={intent} />
          <input
            ref={payloadInputRef}
            type="hidden"
            name={payloadFieldName}
            defaultValue="[]"
          />
          {extraHiddenFields.map((field) => (
            <input
              key={field.name}
              type="hidden"
              name={field.name}
              value={field.value}
            />
          ))}

          {visibleQuestions.map((question, questionIndex) => {
            const questionTextLength = String(question.question_text ?? "").trim()
              .length;
            const visibleSubs = visibleSubCounts[questionIndex] ?? 0;
            const isLastQuestion = questionIndex === visibleQCount - 1;

            return (
              <div
                key={`question-${question.question_order}`}
                className="space-y-2"
              >
                <div className="overflow-hidden rounded-2xl border border-(--primary-color)/20">
                  {/* Question header */}
                  <div className="flex items-center gap-2.5 border-b border-(--primary-color)/12 bg-(--seventh-color) px-4 py-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-(--primary-color)/16 text-sm font-semibold text-(--primary-color)">
                      {questionIndex + 1}
                    </div>
                    <span className="flex-1 text-[15px] font-semibold text-(--text-primary)">
                      Pergunta {questionIndex + 1}
                    </span>
                    {allowVariableQuestionCount &&
                      questionIndex > 0 &&
                      isLastQuestion && (
                        <button
                          type="button"
                          onClick={() => removeLastQuestion(visibleQCount)}
                          className="flex items-center gap-1 text-[13px] text-(--text-tertiary) transition-colors hover:text-(--negative)"
                        >
                          <FaTrashCan aria-hidden className="text-[0.7rem]" />
                          Remover
                        </button>
                      )}
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-(--text-secondary)">
                        Ativa
                      </span>
                      {renderToggle(
                        question.is_active !== false,
                        () =>
                          setQuestionActive(
                            questionIndex,
                            !(question.is_active !== false),
                          ),
                        `Ativar pergunta ${questionIndex + 1}`,
                      )}
                    </div>
                  </div>

                  {/* Question body */}
                  <div className="bg-(--bg-secondary) px-4 pb-4 pt-3.5">
                    <input
                      type="text"
                      value={question.question_text}
                      onChange={(e) =>
                        setQuestionText(questionIndex, e.target.value)
                      }
                      maxLength={MAX_QUESTION_LENGTH}
                      placeholder="Escreva a pergunta principal (20–150 caracteres)"
                      className="w-full rounded-lg border border-(--primary-color)/20 bg-(--bg-tertiary) px-3.5 py-2.5 text-[15px] text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
                    />
                    {renderCounter(
                      questionTextLength,
                      !requireAllThree,
                      "mb-3.5 mt-1",
                    )}

                    {/* Subquestions */}
                    {visibleSubs > 0 && (
                      <div className="mb-3 space-y-2.5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-(--text-secondary)">
                          Subperguntas
                        </p>
                        {(question.subquestions ?? [])
                          .slice(0, visibleSubs)
                          .map((subquestion, subquestionIndex) => {
                            const subquestionTextLength = String(
                              subquestion.subquestion_text ?? "",
                            ).trim().length;
                            const isLastSub =
                              subquestionIndex === visibleSubs - 1;

                            return (
                              <div
                                key={`subquestion-${question.question_order}-${subquestion.subquestion_order}`}
                                className="flex items-start gap-2.5"
                              >
                                <div className="mt-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-(--primary-color)/12 text-xs font-semibold text-(--primary-color)">
                                  {subquestionIndex + 1}
                                </div>
                                <div className="flex-1 rounded-lg border border-(--primary-color)/14 border-l-2 border-l-(--primary-color) bg-(--bg-tertiary) px-3 py-2.5">
                                  <div className="mb-2 flex items-center gap-2">
                                    <span className="text-[13px] font-medium text-(--text-secondary)">
                                      Subpergunta {subquestionIndex + 1}
                                    </span>
                                    <div className="ml-auto flex items-center gap-2">
                                      <span className="text-[13px] text-(--text-secondary)">
                                        Ativa
                                      </span>
                                      {renderToggle(
                                        subquestion.is_active === true,
                                        () =>
                                          setSubActive(
                                            questionIndex,
                                            subquestionIndex,
                                            !(subquestion.is_active === true),
                                          ),
                                        `Ativar subpergunta ${questionIndex + 1}.${subquestionIndex + 1}`,
                                      )}
                                    </div>
                                  </div>
                                  <input
                                    type="text"
                                    value={subquestion.subquestion_text}
                                    onChange={(e) =>
                                      setSubText(
                                        questionIndex,
                                        subquestionIndex,
                                        e.target.value,
                                      )
                                    }
                                    maxLength={MAX_QUESTION_LENGTH}
                                    placeholder={`Escreva a subpergunta ${questionIndex + 1}.${subquestionIndex + 1} (20–150 caracteres)`}
                                    className="w-full rounded-md border border-(--primary-color)/16 bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
                                  />
                                  <div className="mt-1.5 flex items-center gap-2">
                                    {isLastSub && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeLastSub(questionIndex, visibleSubs)
                                        }
                                        className="flex items-center gap-1 text-[13px] text-(--text-tertiary) transition-colors hover:text-(--negative)"
                                      >
                                        <FaTrashCan
                                          aria-hidden
                                          className="text-[0.7rem]"
                                        />
                                        Remover
                                      </button>
                                    )}
                                    {renderCounter(
                                      subquestionTextLength,
                                      true,
                                      "ml-auto",
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {/* Add subquestion */}
                    {visibleSubs < TOTAL_SUBQUESTIONS ? (
                      <button
                        type="button"
                        onClick={() => addSub(questionIndex)}
                        className="inline-flex items-center gap-2 rounded-lg border border-(--primary-color)/30 bg-(--primary-color)/8 px-3 py-2 text-[13px] font-medium text-(--primary-color) transition-colors hover:bg-(--primary-color)/15"
                      >
                        <FaPlus aria-hidden className="text-[0.7rem]" />
                        Adicionar subpergunta
                        {visibleSubs > 0 && (
                          <span className="text-(--text-tertiary)">
                            ({visibleSubs}/3)
                          </span>
                        )}
                      </button>
                    ) : (
                      <p className="text-[13px] text-(--text-tertiary)">
                        Limite de 3 subperguntas atingido
                      </p>
                    )}
                  </div>
                </div>

                {/* Add next question (catálogo) */}
                {allowVariableQuestionCount &&
                  isLastQuestion &&
                  visibleQCount < TOTAL_QUESTIONS && (
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-(--primary-color)/30 py-2.5 text-[13px] font-medium text-(--primary-color) transition-colors hover:bg-(--primary-color)/8"
                    >
                      <FaPlus aria-hidden className="text-[0.7rem]" />
                      Adicionar pergunta {visibleQCount + 1}
                    </button>
                  )}
              </div>
            );
          })}

          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[13px] text-rose-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary font-poppins px-6 py-3 text-sm"
          >
            {submitLabel}
          </button>
        </fetcher.Form>
      )}

      {fetcher.state === "submitting" && (
        <div className="pointer-events-none absolute inset-0 rounded-xl border border-(--quaternary-color)/12 bg-(--bg-primary)/35 backdrop-blur-[1px]" />
      )}
    </div>
  );
}
