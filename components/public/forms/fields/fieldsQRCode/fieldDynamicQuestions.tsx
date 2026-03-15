import type { FeedbackAnswerValue } from 'lib/interfaces/contracts/qrcode.contract';
import type { FieldDynamicQuestionsProps } from './ui.types';

const ANSWER_OPTIONS: Array<{ value: FeedbackAnswerValue; label: string }> = [
  { value: 'PESSIMO', label: 'Péssimo' },
  { value: 'RUIM', label: 'Ruim' },
  { value: 'MEDIANA', label: 'Mediana' },
  { value: 'BOA', label: 'Boa' },
  { value: 'OTIMA', label: 'Ótima' },
];

const ANSWER_HELPER: Record<FeedbackAnswerValue, string> = {
  PESSIMO: 'Muito abaixo do esperado',
  RUIM: 'Abaixo do esperado',
  MEDIANA: 'Atendeu parcialmente',
  BOA: 'Boa experiência geral',
  OTIMA: 'Excelente experiência',
};

export default function FieldDynamicQuestions({
  questions,
  answers,
  onAnswerChange,
}: FieldDynamicQuestionsProps) {
  if (!questions.length) {
    return null;
  }

  const sortedQuestions = [...questions].sort(
    (left, right) => left.question_order - right.question_order,
  );

  return (
    <div className="space-y-3">
      {sortedQuestions.map((question) => {
        const selectedAnswer =
          answers.find((answer) => answer.question_id === question.id)?.answer_value ?? '';

        return (
          <div
            key={question.id}
            className="rounded-xl border border-(--quaternary-color)/15 bg-(--seventh-color)/70 p-3"
          >
            <p className="mb-2 text-sm font-medium text-(--text-primary) font-work-sans">
              {question.question_order}. {question.question_text}
            </p>

            <div
              className="flex snap-x gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-x-visible"
              role="radiogroup"
              aria-label={`Pergunta ${question.question_order}`}
            >
              {ANSWER_OPTIONS.map((option) => {
                const isSelected = selectedAnswer === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onAnswerChange(question.id, option.value)}
                    className={`min-w-[108px] shrink-0 rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-200 font-work-sans sm:min-w-0 ${
                      isSelected
                        ? 'border-(--primary-color) bg-(--primary-color)/15 text-(--text-primary) shadow-[0_0_0_1px_var(--primary-color)]'
                        : 'border-(--quaternary-color)/20 bg-(--eighth-color)/80 text-(--text-secondary) hover:border-(--primary-color)/45 hover:bg-(--primary-color)/8 hover:text-(--text-primary)'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <p className="mt-2 text-xs text-(--text-secondary) font-work-sans">
              {selectedAnswer
                ? ANSWER_HELPER[selectedAnswer as FeedbackAnswerValue]
                : 'Toque em uma opção para responder'}
            </p>
          </div>
        );
      })}
    </div>
  );
}
