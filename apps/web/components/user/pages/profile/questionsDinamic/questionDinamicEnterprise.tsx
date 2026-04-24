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
        className="space-y-4"
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

          return (
            <div
              key={`company-question-${question.question_order}`}
              className="rounded-xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-(--text-primary)">
                  Pergunta {question.question_order}
                </p>
                <label className="flex items-center gap-2 text-xs text-(--text-secondary)">
                  <input
                    type="checkbox"
                    checked={question.is_active ?? true}
                    onChange={(event) => {
                      const checked = event.target.checked;

                      setCompanyQuestions((previousQuestions) => {
                        const next = [...previousQuestions];
                        const current = next[questionIndex] ?? question;

                        next[questionIndex] = {
                          ...current,
                          is_active: checked,
                        };

                        return next;
                      });
                    }}
                  />
                  Ativa
                </label>
              </div>

              <input
                type="text"
                value={question.question_text}
                onChange={(event) => {
                  const value = event.target.value;

                  setCompanyQuestions((previousQuestions) => {
                    const next = [...previousQuestions];
                    const current = next[questionIndex] ?? question;

                    next[questionIndex] = {
                      ...current,
                      question_text: value,
                    };

                    return next;
                  });
                }}
                maxLength={MAX_QUESTION_LENGTH}
                placeholder="Escreva a pergunta principal (20 a 150 caracteres)"
                className="w-full rounded-lg border border-(--quaternary-color)/14 bg-(--bg-tertiary) px-3 py-2 text-sm text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
              />

              <p className="mt-1 text-[11px] text-(--text-tertiary)">
                {questionTextLength}/{MAX_QUESTION_LENGTH} caracteres
              </p>

              <div className="mt-3 space-y-2">
                {(question.subquestions ?? []).map(
                  (subquestion, subquestionIndex) => {
                    const subquestionTextLength = String(
                      subquestion.subquestion_text ?? "",
                    ).trim().length;

                    return (
                      <div
                        key={`company-subquestion-${question.question_order}-${subquestion.subquestion_order}`}
                        className="rounded-lg border border-(--quaternary-color)/10 bg-(--bg-tertiary) p-3"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-(--text-primary)">
                            Subpergunta {question.question_order}.
                            {subquestion.subquestion_order}
                          </p>
                          <label className="flex items-center gap-2 text-[11px] text-(--text-secondary)">
                            <input
                              type="checkbox"
                              checked={subquestion.is_active === true}
                              onChange={(event) => {
                                const checked = event.target.checked;

                                setCompanyQuestions((previousQuestions) => {
                                  const next = [...previousQuestions];
                                  const currentQuestion =
                                    next[questionIndex] ?? question;
                                  const currentSubquestions = [
                                    ...(currentQuestion.subquestions ?? []),
                                  ];
                                  const currentSubquestion =
                                    currentSubquestions[subquestionIndex] ??
                                    subquestion;

                                  currentSubquestions[subquestionIndex] = {
                                    ...currentSubquestion,
                                    is_active: checked,
                                  };

                                  next[questionIndex] = {
                                    ...currentQuestion,
                                    subquestions: currentSubquestions,
                                  };

                                  return next;
                                });
                              }}
                            />
                            Ativa
                          </label>
                        </div>

                        <input
                          type="text"
                          value={subquestion.subquestion_text}
                          onChange={(event) => {
                            const value = event.target.value;

                            setCompanyQuestions((previousQuestions) => {
                              const next = [...previousQuestions];
                              const currentQuestion =
                                next[questionIndex] ?? question;
                              const currentSubquestions = [
                                ...(currentQuestion.subquestions ?? []),
                              ];
                              const currentSubquestion =
                                currentSubquestions[subquestionIndex] ??
                                subquestion;

                              currentSubquestions[subquestionIndex] = {
                                ...currentSubquestion,
                                subquestion_text: value,
                              };

                              next[questionIndex] = {
                                ...currentQuestion,
                                subquestions: currentSubquestions,
                              };

                              return next;
                            });
                          }}
                          maxLength={MAX_QUESTION_LENGTH}
                          placeholder="Escreva a subpergunta (20 a 150 caracteres)"
                          className="w-full rounded-lg border border-(--quaternary-color)/14 bg-(--bg-secondary) px-3 py-2 text-xs text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
                        />

                        <p className="mt-1 text-[10px] text-(--text-tertiary)">
                          {subquestionTextLength}/{MAX_QUESTION_LENGTH}{" "}
                          caracteres
                        </p>
                      </div>
                    );
                  },
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
