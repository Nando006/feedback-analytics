/**
 * Resultado da action de atualização do relatório de insights.
 * Usado em: pages/user/feedbacks/insights/feedbackInsightsReport.tsx.
 */
export type FeedbackInsightsReportActionData = {
  ok?: boolean;
  error?: string;
  errorCode?:
    | 'insufficient_feedbacks_for_analysis'
    | 'item_selection_required';
};
