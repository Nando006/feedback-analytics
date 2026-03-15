import type { FeedbackAnswerValue } from 'lib/interfaces/contracts/qrcode.contract';
import type { FieldDynamicQuestionsProps } from './ui.types';

const ANSWER_OPTIONS: Array<{ value: FeedbackAnswerValue; label: string }> = [
  { value: 'PESSIMO', label: 'Péssimo' },
  { value: 'RUIM', label: 'Ruim' },
  { value: 'MEDIANA', label: 'Mediana' },
  { value: 'BOA', label: 'Boa' },
  { value: 'OTIMA', label: 'Ótima' },
];

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
    <div className="space-y-4">
      {sortedQuestions.map((question) => {
        const selectedAnswer =
          answers.find((answer) => answer.question_id === question.id)?.answer_value ?? '';

        return (
          <div key={question.id}>
            <label className="mb-2 block text-sm font-medium text-(--text-primary) font-work-sans">
              {question.question_order}. {question.question_text}
            </label>
            <select
              value={selectedAnswer}
              onChange={(event) =>
                onAnswerChange(question.id, event.target.value as FeedbackAnswerValue)
              }
              className="w-full rounded-lg border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 py-3 text-(--text-primary) outline-none focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 font-work-sans"
            >
              <option value="">Selecione uma opção</option>
              {ANSWER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
