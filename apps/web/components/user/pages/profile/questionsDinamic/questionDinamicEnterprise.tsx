import type {
  CollectingDataEnterprise,
  CompanyFeedbackQuestionInput,
} from "lib/interfaces/entities/enterprise.entity";
import type { ActionData } from "lib/interfaces/contracts/action-data.contract";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFetcher, useRouteLoaderData } from "react-router-dom";
import { useToast } from "components/public/forms/messages/useToast";
import { INTENT_FEEDBACK_SETTINGS_SAVE_COMPANY_QUESTIONS } from "src/lib/constants/routes/intents";

const TOTAL_QUESTIONS = 3;
const TOTAL_SUBQUESTIONS = 3;
const MIN_QUESTION_LENGTH = 20;
const MAX_QUESTION_LENGTH = 150;

const DEFAULT_COMPANY_QUESTIONS: Array<{
  question_order: 1 | 2 | 3;
  question_text: string;
}> = [
  {
    question_order: 1,
    question_text: "Como foi sua experiência em relação ao atendimento?",
  },
  {
    question_order: 2,
    question_text: "O que você achou da qualidade do produto/serviço?",
  },
  {
    question_order: 3,
    question_text:
      "Como você avalia a relação entre o valor pago e a qualidade do produto/serviço?",
  },
];

function hasValidQuestionLength(text: string) {
  return (
    text.length >= MIN_QUESTION_LENGTH && text.length <= MAX_QUESTION_LENGTH
  );
}

function createEmptySubquestion(subquestionOrder: 1 | 2 | 3) {
  return {
    subquestion_order: subquestionOrder,
    subquestion_text: "",
    is_active: false,
  };
}

function normalizeCompanyFeedbackQuestions(
  items: CollectingDataEnterprise["company_feedback_questions"] | undefined,
): CompanyFeedbackQuestionInput[] {
  const byOrder = new Map<number, CompanyFeedbackQuestionInput>();

  (items ?? []).forEach((item) => {
    const order = Number(item.question_order);

    if (!Number.isInteger(order) || order < 1 || order > 3) {
      return;
    }

    const subquestionByOrder = new Map<
      number,
      { subquestion_text: string; is_active: boolean }
    >();

    (item.subquestions ?? []).forEach((subquestion) => {
      const subOrder = Number(subquestion.subquestion_order);
      if (!Number.isInteger(subOrder) || subOrder < 1 || subOrder > 3) {
        return;
      }

      subquestionByOrder.set(subOrder, {
        subquestion_text: String(subquestion.subquestion_text ?? ""),
        is_active: subquestion.is_active === true,
      });
    });

    byOrder.set(order, {
      question_order: order as 1 | 2 | 3,
      question_text: item.question_text ?? "",
      is_active: item.is_active ?? true,
      subquestions: Array.from(
        { length: TOTAL_SUBQUESTIONS },
        (_, subIndex) => {
          const subOrder = (subIndex + 1) as 1 | 2 | 3;
          const currentSubquestion = subquestionByOrder.get(subOrder);

          return {
            subquestion_order: subOrder,
            subquestion_text: currentSubquestion?.subquestion_text ?? "",
            is_active: currentSubquestion?.is_active ?? false,
          };
        },
      ),
    });
  });

  return Array.from({ length: TOTAL_QUESTIONS }, (_, index) => {
    const questionOrder = (index + 1) as 1 | 2 | 3;
    const current = byOrder.get(questionOrder);

    return {
      question_order: questionOrder,
      question_text:
        current?.question_text ??
        DEFAULT_COMPANY_QUESTIONS[index]?.question_text ??
        "",
      is_active: current?.is_active ?? true,
      subquestions: current?.subquestions ?? [
        createEmptySubquestion(1),
        createEmptySubquestion(2),
        createEmptySubquestion(3),
      ],
    };
  });
}

function validateCompanyQuestions(questions: CompanyFeedbackQuestionInput[]) {
  if (questions.length !== TOTAL_QUESTIONS) {
    return "A empresa precisa ter exatamente 3 perguntas principais.";
  }

  for (const question of questions) {
    const questionText = String(question.question_text ?? "").trim();

    if (!hasValidQuestionLength(questionText)) {
      return "Cada pergunta da empresa deve ter entre 20 e 150 caracteres.";
    }

    const subquestions = question.subquestions ?? [];

    if (subquestions.length > TOTAL_SUBQUESTIONS) {
      return "Cada pergunta da empresa aceita no máximo 3 subperguntas.";
    }

    for (const subquestion of subquestions) {
      const subquestionText = String(subquestion.subquestion_text ?? "").trim();
      const isActive = subquestion.is_active === true;

      if (!subquestionText) {
        if (isActive) {
          return "Subperguntas ativas precisam ter texto válido.";
        }

        continue;
      }

      if (!hasValidQuestionLength(subquestionText)) {
        return "Cada subpergunta da empresa deve ter entre 20 e 150 caracteres.";
      }
    }
  }

  return null;
}

function computeSubCounts(
  questions: CompanyFeedbackQuestionInput[],
): [number, number, number] {
  const counts: [number, number, number] = [0, 0, 0];
  questions.forEach((q, qi) => {
    if (qi >= 3) return;
    let subCount = 0;
    (q.subquestions ?? []).forEach((s, si) => {
      if (String(s.subquestion_text ?? "").trim().length > 0 || s.is_active)
        subCount = si + 1;
    });
    counts[qi] = subCount;
  });
  return counts;
}

export default function QuestionDinamicEnterprise() {
  const { collecting } = useRouteLoaderData("user") as {
    collecting: CollectingDataEnterprise | null;
  };

  const fetcher = useFetcher();
  const toast = useToast();

  const [companyQuestions, setCompanyQuestions] = useState<
    CompanyFeedbackQuestionInput[]
  >(() =>
    normalizeCompanyFeedbackQuestions(collecting?.company_feedback_questions),
  );
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [visibleSubCounts, setVisibleSubCounts] = useState<
    [number, number, number]
  >(() =>
    computeSubCounts(
      normalizeCompanyFeedbackQuestions(collecting?.company_feedback_questions),
    ),
  );
  const companyQuestionsInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const data = fetcher.data as ActionData | undefined;
    if (!data) return;

    if (data.ok) {
      toast.success(
        "Configurações salvas!",
        data.message || "Perguntas da empresa atualizadas com sucesso.",
      );
    } else {
      toast.error(
        "Erro ao salvar configurações",
        data.message || "Tente novamente em instantes.",
      );
    }
  }, [fetcher.data, toast]);

  const setQuestionActive = useCallback((qi: number, value: boolean) => {
    setCompanyQuestions((prev) => {
      const next = [...prev];
      next[qi] = { ...next[qi], is_active: value };
      return next;
    });
  }, []);

  const setQuestionText = useCallback((qi: number, value: string) => {
    setCompanyQuestions((prev) => {
      const next = [...prev];
      next[qi] = { ...next[qi], question_text: value };
      return next;
    });
  }, []);

  const setSubActive = useCallback((qi: number, si: number, value: boolean) => {
    setCompanyQuestions((prev) => {
      const next = [...prev];
      const subs = [...(next[qi].subquestions ?? [])];
      subs[si] = { ...subs[si], is_active: value };
      next[qi] = { ...next[qi], subquestions: subs };
      return next;
    });
  }, []);

  const setSubText = useCallback((qi: number, si: number, value: string) => {
    setCompanyQuestions((prev) => {
      const next = [...prev];
      const subs = [...(next[qi].subquestions ?? [])];
      subs[si] = { ...subs[si], subquestion_text: value };
      next[qi] = { ...next[qi], subquestions: subs };
      return next;
    });
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
    setCompanyQuestions((prev) => {
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
      const validationMessage = validateCompanyQuestions(companyQuestions);

      if (validationMessage) {
        event.preventDefault();
        setCompanyError(validationMessage);
        return;
      }

      setCompanyError(null);

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      if (companyQuestionsInputRef.current) {
        companyQuestionsInputRef.current.value = JSON.stringify(
          companyQuestions.map((question, index) => ({
            question_order: (index + 1) as 1 | 2 | 3,
            question_text: String(question.question_text ?? "").trim(),
            is_active: question.is_active ?? true,
            subquestions: (question.subquestions ?? []).map(
              (subquestion, subIndex) => ({
                subquestion_order: (subIndex + 1) as 1 | 2 | 3,
                subquestion_text: String(
                  subquestion.subquestion_text ?? "",
                ).trim(),
                is_active: subquestion.is_active === true,
              }),
            ),
          })),
        );
      }
    },
    [companyQuestions],
  );

  return (
    <div className="relative">
      <fetcher.Form
        method="post"
        action="/user/edit/feedback-settings"
        onSubmit={handleSubmit}
        className="space-y-3"
      >
        <input
          type="hidden"
          name="intent"
          value={INTENT_FEEDBACK_SETTINGS_SAVE_COMPANY_QUESTIONS}
        />
        <input
          ref={companyQuestionsInputRef}
          type="hidden"
          name="company_feedback_questions"
          defaultValue="[]"
        />

        {companyQuestions.map((question, questionIndex) => {
          const questionTextLength = String(question.question_text ?? "").trim()
            .length;
          const visibleSubs = visibleSubCounts[questionIndex] ?? 0;

          return (
            <div
              key={`company-question-${question.question_order}`}
              className="overflow-hidden rounded-xl border border-(--quaternary-color)/10"
            >
              {/* Question header */}
              <div className="flex items-center gap-2 bg-(--bg-tertiary)/80 px-4 py-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--primary-color)/20 text-xs font-bold text-(--primary-color)">
                  {question.question_order}
                </div>
                <span className="flex-1 text-sm font-semibold text-(--text-secondary)">
                  Pergunta {question.question_order}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-(--text-tertiary)">Ativa</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={question.is_active ?? true}
                    onClick={() =>
                      setQuestionActive(questionIndex, !(question.is_active ?? true))
                    }
                    className={`relative h-4 w-7 rounded-full transition-colors duration-200 focus:outline-none ${(question.is_active ?? true) ? "bg-(--primary-color)" : "bg-(--seventh-color)"}`}
                  >
                    <span
                      className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${(question.is_active ?? true) ? "translate-x-3.5" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>
              </div>

              {/* Question body */}
              <div className="bg-(--bg-secondary) px-4 pb-4 pt-3">
                <input
                  type="text"
                  value={question.question_text}
                  onChange={(e) => setQuestionText(questionIndex, e.target.value)}
                  maxLength={MAX_QUESTION_LENGTH}
                  placeholder="Escreva a pergunta principal (20–150 caracteres)"
                  className="w-full rounded-lg border border-(--quaternary-color)/14 bg-(--bg-tertiary) px-3 py-2 text-sm text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
                />
                <p className="mb-3 mt-0.5 text-right text-[11px] text-(--text-tertiary)">
                  {questionTextLength}/{MAX_QUESTION_LENGTH}
                </p>

                {/* Subquestions */}
                {visibleSubs > 0 && (
                  <div className="mb-3 space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                      Subperguntas
                    </p>
                    {(question.subquestions ?? [])
                      .slice(0, visibleSubs)
                      .map((subquestion, subquestionIndex) => {
                        const subquestionTextLength = String(
                          subquestion.subquestion_text ?? "",
                        ).trim().length;
                        const isLastSub = subquestionIndex === visibleSubs - 1;

                        return (
                          <div
                            key={`company-subquestion-${question.question_order}-${subquestion.subquestion_order}`}
                            className="flex items-start gap-2"
                          >
                            <div className="mt-2.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-(--quaternary-color)/20 bg-(--bg-tertiary) text-[9px] text-(--text-tertiary)">
                              {subquestionIndex + 1}
                            </div>
                            <div className="flex-1 rounded-lg border border-(--quaternary-color)/8 bg-(--bg-tertiary) px-3 py-2">
                              <div className="mb-1.5 flex items-center gap-2">
                                <span className="text-[10px] text-(--text-tertiary)">
                                  {question.question_order}.{subquestion.subquestion_order}
                                </span>
                                {isLastSub && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeLastSub(questionIndex, visibleSubs)
                                    }
                                    className="text-[9px] text-(--text-tertiary) transition-colors hover:text-rose-400"
                                  >
                                    remover
                                  </button>
                                )}
                                <div className="ml-auto flex items-center gap-1.5">
                                  <span className="text-[10px] text-(--text-tertiary)">
                                    Ativa
                                  </span>
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={subquestion.is_active === true}
                                    onClick={() =>
                                      setSubActive(
                                        questionIndex,
                                        subquestionIndex,
                                        !(subquestion.is_active === true),
                                      )
                                    }
                                    className={`relative h-3.5 w-6 rounded-full transition-colors duration-200 focus:outline-none ${subquestion.is_active === true ? "bg-(--primary-color)" : "bg-(--seventh-color)"}`}
                                  >
                                    <span
                                      className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${subquestion.is_active === true ? "translate-x-3" : "translate-x-0.5"}`}
                                    />
                                  </button>
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
                                placeholder={`Subpergunta ${question.question_order}.${subquestion.subquestion_order} (20–150 caracteres)`}
                                className="w-full rounded-md border border-(--quaternary-color)/8 bg-(--bg-secondary) px-2.5 py-1.5 text-xs text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
                              />
                              <p className="mt-0.5 text-right text-[10px] text-(--text-tertiary)">
                                {subquestionTextLength}/{MAX_QUESTION_LENGTH}
                              </p>
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
                    onClick={() => addSub(questionIndex)}
                    className="flex items-center gap-1.5 text-[11px] text-(--primary-color) transition-opacity hover:opacity-75"
                  >
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-(--primary-color)/50 text-xs leading-none">
                      +
                    </span>
                    Adicionar subpergunta
                    {visibleSubs > 0 && (
                      <span className="text-(--text-tertiary)">
                        ({visibleSubs}/3)
                      </span>
                    )}
                  </button>
                ) : (
                  <p className="text-[11px] text-(--text-tertiary)">
                    Limite de 3 subperguntas atingido
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {companyError && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {companyError}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary font-poppins px-6 py-3 text-sm"
        >
          Salvar Perguntas da Empresa
        </button>
      </fetcher.Form>

      {fetcher.state === "submitting" && (
        <div className="pointer-events-none absolute inset-0 rounded-xl border border-(--quaternary-color)/12 bg-(--bg-primary)/35 backdrop-blur-[1px]" />
      )}
    </div>
  );
}
