export type FeedbackAnalysis = {
  sentiment: 'positive' | 'neutral' | 'negative';
  categories: string[] | null;
  keywords: string[] | null;
};

export type FeedbackWithAnalysisRow = {
  id: string;
  message: string;
  rating: number | null;
  created_at: string;
  feedback_analysis: FeedbackAnalysis | null;
};

type FeedbackWithAnalysisRowRaw = Omit<
  FeedbackWithAnalysisRow,
  'feedback_analysis'
> & {
  feedback_analysis: FeedbackAnalysis | FeedbackAnalysis[] | null;
};

export type FeedbackWithAnalysisRowNormalized = FeedbackWithAnalysisRow & {
  feedback_analysis: FeedbackAnalysis;
};

export function normalizeFeedbackAnalysisRows(
  data: unknown,
): FeedbackWithAnalysisRowNormalized[] {
  const rows = (Array.isArray(data) ? data : []) as FeedbackWithAnalysisRowRaw[];

  return rows
    .map((row): FeedbackWithAnalysisRow => {
      const analysis = Array.isArray(row.feedback_analysis)
        ? (row.feedback_analysis[0] ?? null)
        : row.feedback_analysis;

      return {
        id: row.id,
        message: row.message,
        rating: row.rating,
        created_at: row.created_at,
        feedback_analysis: analysis,
      };
    })
    .filter(
      (
        row,
      ): row is FeedbackWithAnalysisRowNormalized => row.feedback_analysis !== null,
    );
}
