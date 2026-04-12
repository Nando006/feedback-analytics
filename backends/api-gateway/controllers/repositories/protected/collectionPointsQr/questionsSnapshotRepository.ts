import type express from 'express';
import type {
  CatalogKind,
  CatalogQuestionSnapshot,
  QuestionOrder,
  SubquestionOrder,
} from './types.js';

type SnapshotResult = {
  error: boolean;
  snapshotByCatalogItem: Map<string, CatalogQuestionSnapshot[]>;
};

export async function getCatalogQuestionsSnapshot(params: {
  supabase: express.Request['supabase'];
  enterpriseId: string;
  kind: CatalogKind;
  catalogItemIds: string[];
}): Promise<SnapshotResult> {
  const { supabase, enterpriseId, kind, catalogItemIds } = params;

  const snapshotByCatalogItem = new Map<string, CatalogQuestionSnapshot[]>();

  if (!supabase || catalogItemIds.length === 0) {
    return {
      error: false,
      snapshotByCatalogItem,
    };
  }

  const { data: questionRows, error: questionRowsError } = await supabase
    .from('questions_of_feedbacks')
    .select(
      'id, catalog_item_id, question_order, question_text, is_active',
    )
    .eq('enterprise_id', enterpriseId)
    .eq('scope_type', kind)
    .in('catalog_item_id', catalogItemIds)
    .order('question_order', { ascending: true });

  if (questionRowsError) {
    return {
      error: true,
      snapshotByCatalogItem,
    };
  }

  const normalizedQuestions = (questionRows ?? [])
    .filter((row) => typeof row.id === 'string' && typeof row.catalog_item_id === 'string')
    .map((row) => ({
      id: row.id as string,
      catalog_item_id: row.catalog_item_id as string,
      question_order: Number(row.question_order) as QuestionOrder,
      question_text: String(row.question_text ?? ''),
      is_active: row.is_active === true,
    }));

  const questionIds = normalizedQuestions.map((question) => question.id);
  const subquestionsByQuestionId = new Map<
    string,
    CatalogQuestionSnapshot['subquestions']
  >();

  if (questionIds.length > 0) {
    const { data: subquestionRows, error: subquestionRowsError } = await supabase
      .from('feedback_question_subquestions')
      .select(
        'id, question_id, subquestion_order, subquestion_text, is_active',
      )
      .in('question_id', questionIds)
      .order('subquestion_order', { ascending: true });

    if (subquestionRowsError) {
      return {
        error: true,
        snapshotByCatalogItem,
      };
    }

    (subquestionRows ?? []).forEach((row) => {
      const questionId = String(row.question_id ?? '');
      if (!questionId) {
        return;
      }

      const current = subquestionsByQuestionId.get(questionId) ?? [];

      current.push({
        id: String(row.id),
        question_id: questionId,
        subquestion_order: Number(row.subquestion_order) as SubquestionOrder,
        subquestion_text: String(row.subquestion_text ?? ''),
        is_active: row.is_active === true,
      });

      subquestionsByQuestionId.set(questionId, current);
    });
  }

  normalizedQuestions.forEach((question) => {
    const current = snapshotByCatalogItem.get(question.catalog_item_id) ?? [];

    current.push({
      id: question.id,
      question_order: question.question_order,
      question_text: question.question_text,
      is_active: question.is_active,
      subquestions: (subquestionsByQuestionId.get(question.id) ?? []).sort(
        (left, right) => left.subquestion_order - right.subquestion_order,
      ),
    });

    snapshotByCatalogItem.set(question.catalog_item_id, current);
  });

  snapshotByCatalogItem.forEach((questions, catalogItemId) => {
    snapshotByCatalogItem.set(
      catalogItemId,
      questions.sort((left, right) => left.question_order - right.question_order),
    );
  });

  return {
    error: false,
    snapshotByCatalogItem,
  };
}
