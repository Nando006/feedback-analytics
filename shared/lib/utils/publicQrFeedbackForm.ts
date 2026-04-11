import type {
  FeedbackQuestionAnswerInput,
  FeedbackQuestionPublic,
  FeedbackSubquestionAnswerInput,
  QrPublicContext,
} from 'lib/interfaces/contracts/qrcode.contract';

export const REQUIRED_QUESTION_COUNT = 3;

function getSortedQuestions(questions: FeedbackQuestionPublic[]) {
  return [...questions].sort(
    (left, right) => left.question_order - right.question_order,
  );
}

export function getActiveSubquestions(questions: FeedbackQuestionPublic[]) {
  return getSortedQuestions(questions).flatMap((question) =>
    [...(question.subquestions ?? [])]
      .filter((subquestion) => subquestion.is_active)
      .sort((left, right) => left.subquestion_order - right.subquestion_order),
  );
}

export function filterAnswersForQuestions(
  answers: FeedbackQuestionAnswerInput[],
  questions: FeedbackQuestionPublic[],
) {
  const questionIds = new Set(questions.map((question) => question.id));

  return answers.filter((answer) => questionIds.has(answer.question_id));
}

export function filterSubanswersForQuestions(
  subanswers: FeedbackSubquestionAnswerInput[],
  questions: FeedbackQuestionPublic[],
) {
  const subquestionIds = new Set(
    getActiveSubquestions(questions).map((subquestion) => subquestion.id),
  );

  return subanswers.filter((answer) => subquestionIds.has(answer.subquestion_id));
}

export function hasAllRequiredAnswers(
  answers: FeedbackQuestionAnswerInput[],
  questions: FeedbackQuestionPublic[],
) {
  const questionIds = new Set(questions.map((question) => question.id));

  return (
    answers.length === REQUIRED_QUESTION_COUNT &&
    answers.every((answer) => questionIds.has(answer.question_id))
  );
}

export function hasAllRequiredSubanswers(
  subanswers: FeedbackSubquestionAnswerInput[],
  questions: FeedbackQuestionPublic[],
) {
  const activeSubquestions = getActiveSubquestions(questions);
  const activeSubquestionIds = new Set(
    activeSubquestions.map((subquestion) => subquestion.id),
  );

  return (
    subanswers.length === activeSubquestions.length &&
    subanswers.every((answer) => activeSubquestionIds.has(answer.subquestion_id))
  );
}

export function orderAnswersByQuestions(
  answers: FeedbackQuestionAnswerInput[],
  questions: FeedbackQuestionPublic[],
) {
  const answersByQuestionId = new Map(
    answers.map((answer) => [answer.question_id, answer]),
  );

  return getSortedQuestions(questions)
    .map((question) => answersByQuestionId.get(question.id))
    .filter((answer): answer is FeedbackQuestionAnswerInput => Boolean(answer));
}

export function orderSubanswersByQuestions(
  subanswers: FeedbackSubquestionAnswerInput[],
  questions: FeedbackQuestionPublic[],
) {
  const answersBySubquestionId = new Map(
    subanswers.map((answer) => [answer.subquestion_id, answer]),
  );

  return getActiveSubquestions(questions)
    .map((subquestion) => answersBySubquestionId.get(subquestion.id))
    .filter(
      (answer): answer is FeedbackSubquestionAnswerInput => Boolean(answer),
    );
}

export function getItemKindLabel(itemKind: QrPublicContext['item_kind']) {
  if (itemKind === 'PRODUCT') return 'Produto';
  if (itemKind === 'SERVICE') return 'Serviço';
  if (itemKind === 'DEPARTMENT') return 'Departamento';

  return null;
}
