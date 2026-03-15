import { memo } from 'react';
import type { FieldCompanyFeedbackQuestionsProps } from './ui.types';

const TOTAL_COMPANY_QUESTIONS = 3;

const FieldCompanyFeedbackQuestions = memo(function FieldCompanyFeedbackQuestions({
  questions,
  onChange,
}: FieldCompanyFeedbackQuestionsProps) {
  const ensureQuestion = (index: number) => {
    return (
      questions[index] ?? {
        question_order: (index + 1) as 1 | 2 | 3,
        question_text: '',
        is_active: true,
      }
    );
  };

  return (
    <div className="font-work-sans rounded-xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-(--text-primary)">
          Perguntas Padrão de Feedback (Empresa)
        </h3>
        <p className="mt-1 text-xs text-(--text-tertiary)">
          Edite os 3 campos que aparecerão no feedback geral via QR Code.
        </p>
      </div>

      <div className="space-y-3">
        {Array.from({ length: TOTAL_COMPANY_QUESTIONS }).map((_, index) => {
          const question = ensureQuestion(index);

          return (
            <div
              key={`company-feedback-question-${index}`}
              className="rounded-lg border border-(--quaternary-color)/10 bg-(--seventh-color) p-3"
            >
              <label className="mb-2 block text-xs text-(--text-secondary)">
                Pergunta {index + 1}
              </label>
              <input
                type="text"
                value={question.question_text}
                onChange={(event) => {
                  const nextValue = event.target.value;

                  onChange((prev) => {
                    const next = [...prev];
                    const current =
                      next[index] ?? {
                        question_order: (index + 1) as 1 | 2 | 3,
                        question_text: '',
                        is_active: true,
                      };

                    next[index] = {
                      ...current,
                      question_order: (index + 1) as 1 | 2 | 3,
                      question_text: nextValue,
                      is_active: true,
                    };

                    return next;
                  });
                }}
                className="w-full rounded-lg border border-(--quaternary-color)/14 bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
                placeholder={`Ex.: Pergunta ${index + 1}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default FieldCompanyFeedbackQuestions;
