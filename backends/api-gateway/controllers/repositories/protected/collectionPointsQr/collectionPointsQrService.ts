import type { Request, Response } from 'express';
import {
  API_ERROR_COLLECTION_POINT_ERROR,
  API_ERROR_ENTERPRISE_NOT_FOUND,
  API_ERROR_INVALID_PAYLOAD,
  API_ERROR_UNABLE_TO_ACTIVATE_QR,
  API_ERROR_UNABLE_TO_CREATE_QR_CP,
  API_ERROR_UNABLE_TO_DISABLE_QR,
  API_ERROR_UPDATE_FAILED,
} from 'server/constants/errors.js';
import { sendTypedError } from 'server/utils/sendTypedError.js';
import {
  getCatalogKind,
  hasValidQuestionLength,
  normalizeQuestionOrder,
  normalizeSubquestionOrder,
} from './validation.js';
import { getCatalogQuestionsSnapshot } from './questionsSnapshotRepository.js';
import {
  TOTAL_ITEM_QUESTIONS,
  TOTAL_SUBQUESTIONS_PER_QUESTION,
} from './types.js';
import type {
  CatalogQuestionInput,
  QuestionOrder,
  SubquestionOrder,
} from './types.js';

export async function getQrStatusHandler(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;

  const { data: enterprise, error: enterpriseError } = await supabase
    .from('enterprise')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (enterpriseError || !enterprise) {
    return sendTypedError(
      res,
      404,
      API_ERROR_ENTERPRISE_NOT_FOUND,
      { active: false },
    );
  }

  const { data: cp, error: cpError } = await supabase
    .from('collection_points')
    .select('id')
    .eq('enterprise_id', enterprise.id)
    .eq('type', 'QR_CODE')
    .is('catalog_item_id', null)
    .eq('status', 'ACTIVE')
    .maybeSingle();

  if (cpError) {
    return sendTypedError(
      res,
      500,
      API_ERROR_COLLECTION_POINT_ERROR,
      { active: false },
    );
  }

  return res.json({ active: !!cp, id: cp?.id ?? null });
}

export async function enableQrHandler(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;

  const { data: enterprise, error: enterpriseError } = await supabase
    .from('enterprise')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (enterpriseError || !enterprise) {
    return sendTypedError(
      res,
      404,
      API_ERROR_ENTERPRISE_NOT_FOUND,
    );
  }

  const { data: activeCP } = await supabase
    .from('collection_points')
    .select('id')
    .eq('enterprise_id', enterprise.id)
    .eq('type', 'QR_CODE')
    .is('catalog_item_id', null)
    .eq('status', 'ACTIVE')
    .maybeSingle();

  if (activeCP) {
    return res.json({ id: activeCP.id, active: true });
  }

  const { data: anyCP } = await supabase
    .from('collection_points')
    .select('id')
    .eq('enterprise_id', enterprise.id)
    .eq('type', 'QR_CODE')
    .is('catalog_item_id', null)
    .maybeSingle();

  if (anyCP) {
    const { error: updErr } = await supabase
      .from('collection_points')
      .update({ status: 'ACTIVE', name: 'QR Code' })
      .eq('id', anyCP.id);

    if (updErr) {
      return sendTypedError(
        res,
        500,
        API_ERROR_UNABLE_TO_ACTIVATE_QR,
      );
    }

    return res.json({ id: anyCP.id, active: true });
  }

  const { data: newCP, error: createErr } = await supabase
    .from('collection_points')
    .insert({
      enterprise_id: enterprise.id,
      type: 'QR_CODE',
      status: 'ACTIVE',
      name: 'QR Code',
      catalog_item_id: null,
    })
    .select('id')
    .single();

  if (createErr || !newCP) {
    return sendTypedError(
      res,
      500,
      API_ERROR_UNABLE_TO_CREATE_QR_CP,
    );
  }

  return res.json({ id: newCP.id, active: true });
}

export async function disableQrHandler(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;

  const { data: enterprise, error: enterpriseError } = await supabase
    .from('enterprise')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (enterpriseError || !enterprise) {
    return sendTypedError(
      res,
      404,
      API_ERROR_ENTERPRISE_NOT_FOUND,
    );
  }

  const { data: cp } = await supabase
    .from('collection_points')
    .select('id')
    .eq('enterprise_id', enterprise.id)
    .eq('type', 'QR_CODE')
    .is('catalog_item_id', null)
    .eq('status', 'ACTIVE')
    .maybeSingle();

  if (!cp) {
    return res.json({ active: false });
  }

  const { error: updErr } = await supabase
    .from('collection_points')
    .update({ status: 'INACTIVE' })
    .eq('id', cp.id);

  if (updErr) {
    return sendTypedError(
      res,
      500,
      API_ERROR_UNABLE_TO_DISABLE_QR,
    );
  }

  return res.json({ active: false });
}

export async function getQrCatalogHandler(req: Request, res: Response) {
  const kind = getCatalogKind(req.query.kind);
  if (!kind) {
    return sendTypedError(res, 400, API_ERROR_COLLECTION_POINT_ERROR);
  }

  const supabase = req.supabase!;
  const user = req.user!;

  const { data: enterprise, error: enterpriseError } = await supabase
    .from('enterprise')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (enterpriseError || !enterprise) {
    return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
  }

  const { data: items, error: itemsError } = await supabase
    .from('catalog_items')
    .select('id, name, description, kind')
    .eq('enterprise_id', enterprise.id)
    .eq('kind', kind)
    .eq('status', 'ACTIVE')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (itemsError) {
    return sendTypedError(res, 500, API_ERROR_COLLECTION_POINT_ERROR);
  }

  if (!items || items.length === 0) {
    return res.json({ items: [] });
  }

  const itemIds = items.map((item) => item.id);
  const { data: points, error: pointsError } = await supabase
    .from('collection_points')
    .select('id, catalog_item_id, status, updated_at, created_at')
    .eq('enterprise_id', enterprise.id)
    .eq('type', 'QR_CODE')
    .in('catalog_item_id', itemIds)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (pointsError) {
    return sendTypedError(res, 500, API_ERROR_COLLECTION_POINT_ERROR);
  }

  const pointByCatalog = new Map<
    string,
    {
      id: string;
      status: string;
    }
  >();

  for (const point of points ?? []) {
    if (!point.catalog_item_id || pointByCatalog.has(point.catalog_item_id)) {
      continue;
    }

    pointByCatalog.set(point.catalog_item_id, {
      id: point.id,
      status: point.status,
    });
  }

  const questionsSnapshot = await getCatalogQuestionsSnapshot({
    supabase,
    enterpriseId: enterprise.id,
    kind,
    catalogItemIds: itemIds,
  });

  if (questionsSnapshot.error) {
    return sendTypedError(res, 500, API_ERROR_COLLECTION_POINT_ERROR);
  }

  const responseItems = items.map((item) => {
    const point = pointByCatalog.get(item.id);

    return {
      catalog_item_id: item.id,
      name: item.name,
      description: item.description,
      kind: item.kind,
      active: point?.status === 'ACTIVE',
      collection_point_id: point?.id ?? null,
      questions: questionsSnapshot.snapshotByCatalogItem.get(item.id) ?? [],
    };
  });

  return res.json({ items: responseItems });
}

export async function upsertCatalogQuestionsHandler(req: Request, res: Response) {
  const catalogItemId = String(req.body?.catalog_item_id ?? '').trim();
  if (!catalogItemId) {
    return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
  }

  const rawQuestions = Array.isArray(req.body?.questions)
    ? (req.body.questions as CatalogQuestionInput[])
    : null;

  if (!rawQuestions || rawQuestions.length !== TOTAL_ITEM_QUESTIONS) {
    return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
  }

  const supabase = req.supabase!;
  const user = req.user!;

  const { data: enterprise, error: enterpriseError } = await supabase
    .from('enterprise')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (enterpriseError || !enterprise) {
    return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
  }

  const { data: catalogItem, error: catalogItemError } = await supabase
    .from('catalog_items')
    .select('id, kind, status')
    .eq('id', catalogItemId)
    .eq('enterprise_id', enterprise.id)
    .maybeSingle();

  if (catalogItemError || !catalogItem || catalogItem.status !== 'ACTIVE') {
    return sendTypedError(res, 404, API_ERROR_COLLECTION_POINT_ERROR);
  }

  const catalogKind = getCatalogKind(catalogItem.kind);
  if (!catalogKind) {
    return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
  }

  const questionByOrder = new Map<
    QuestionOrder,
    {
      question_order: QuestionOrder;
      question_text: string;
      is_active: boolean;
      subquestionsByOrder: Map<
        SubquestionOrder,
        {
          subquestion_order: SubquestionOrder;
          subquestion_text: string;
          is_active: boolean;
        }
      >;
    }
  >();

  for (let index = 0; index < rawQuestions.length; index += 1) {
    const rawQuestion = rawQuestions[index];
    if (!rawQuestion || typeof rawQuestion !== 'object') {
      return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
    }

    const questionOrder = normalizeQuestionOrder(
      rawQuestion.question_order,
      index + 1,
    );

    if (questionByOrder.has(questionOrder)) {
      return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
    }

    const questionText = String(rawQuestion.question_text ?? '').trim();
    const questionIsActive = rawQuestion.is_active === true;

    if (questionText.length > 0 && !hasValidQuestionLength(questionText)) {
      return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
    }

    if (questionIsActive && questionText.length === 0) {
      return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
    }

    const rawSubquestions = Array.isArray(rawQuestion.subquestions)
      ? rawQuestion.subquestions.slice(0, TOTAL_SUBQUESTIONS_PER_QUESTION)
      : [];

    const subquestionsByOrder = new Map<
      SubquestionOrder,
      {
        subquestion_order: SubquestionOrder;
        subquestion_text: string;
        is_active: boolean;
      }
    >();

    for (
      let subIndex = 0;
      subIndex < rawSubquestions.length;
      subIndex += 1
    ) {
      const rawSubquestion = rawSubquestions[subIndex];
      if (!rawSubquestion || typeof rawSubquestion !== 'object') {
        return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
      }

      const subquestionOrder = normalizeSubquestionOrder(
        rawSubquestion.subquestion_order,
        subIndex + 1,
      );

      if (subquestionsByOrder.has(subquestionOrder)) {
        return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
      }

      const subquestionText = String(rawSubquestion.subquestion_text ?? '').trim();
      const subquestionIsActive = rawSubquestion.is_active === true;

      if (
        subquestionText.length > 0 &&
        !hasValidQuestionLength(subquestionText)
      ) {
        return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
      }

      if (subquestionIsActive && subquestionText.length === 0) {
        return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
      }

      subquestionsByOrder.set(subquestionOrder, {
        subquestion_order: subquestionOrder,
        subquestion_text: subquestionText,
        is_active: subquestionIsActive,
      });
    }

    questionByOrder.set(questionOrder, {
      question_order: questionOrder,
      question_text: questionText,
      is_active: questionIsActive,
      subquestionsByOrder,
    });
  }

  const orderedQuestions =
    ([1, 2, 3] as QuestionOrder[])
      .map((order) => questionByOrder.get(order))
      .filter((question): question is NonNullable<typeof question> => Boolean(question));

  if (orderedQuestions.length !== TOTAL_ITEM_QUESTIONS) {
    return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
  }

  const hasAnyQuestionText = orderedQuestions.some(
    (question) => question.question_text.length > 0,
  );

  if (!hasAnyQuestionText) {
    const { error: clearError } = await supabase
      .from('questions_of_feedbacks')
      .delete()
      .eq('enterprise_id', enterprise.id)
      .eq('scope_type', catalogKind)
      .eq('catalog_item_id', catalogItem.id);

    if (clearError) {
      return sendTypedError(res, 500, API_ERROR_UPDATE_FAILED);
    }

    return res.json({
      catalog_item_id: catalogItem.id,
      questions: [],
    });
  }

  const hasAllQuestionTexts = orderedQuestions.every(
    (question) => hasValidQuestionLength(question.question_text),
  );

  if (!hasAllQuestionTexts) {
    return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
  }

  for (const question of orderedQuestions) {
    const { data: updatedQuestionRows, error: updateQuestionError } = await supabase
      .from('questions_of_feedbacks')
      .update({
        question_text: question.question_text,
        is_active: question.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('enterprise_id', enterprise.id)
      .eq('scope_type', catalogKind)
      .eq('catalog_item_id', catalogItem.id)
      .eq('question_order', question.question_order)
      .select('id');

    if (updateQuestionError) {
      return sendTypedError(res, 500, API_ERROR_UPDATE_FAILED);
    }

    let questionId = updatedQuestionRows?.[0]?.id as string | undefined;

    if (!questionId) {
      const { data: insertedQuestion, error: insertQuestionError } = await supabase
        .from('questions_of_feedbacks')
        .insert({
          enterprise_id: enterprise.id,
          scope_type: catalogKind,
          catalog_item_id: catalogItem.id,
          question_order: question.question_order,
          question_text: question.question_text,
          is_active: question.is_active,
        })
        .select('id')
        .single();

      if (insertQuestionError || !insertedQuestion) {
        return sendTypedError(res, 500, API_ERROR_UPDATE_FAILED);
      }

      questionId = insertedQuestion.id as string;
    }

    for (const subquestionOrder of [1, 2, 3] as SubquestionOrder[]) {
      const subquestion = question.subquestionsByOrder.get(subquestionOrder);

      if (!subquestion || subquestion.subquestion_text.length === 0) {
        const { error: deleteSubquestionError } = await supabase
          .from('feedback_question_subquestions')
          .delete()
          .eq('question_id', questionId)
          .eq('subquestion_order', subquestionOrder);

        if (deleteSubquestionError) {
          return sendTypedError(res, 500, API_ERROR_UPDATE_FAILED);
        }

        continue;
      }

      const { data: updatedSubquestionRows, error: updateSubquestionError } =
        await supabase
          .from('feedback_question_subquestions')
          .update({
            subquestion_text: subquestion.subquestion_text,
            is_active: subquestion.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('question_id', questionId)
          .eq('subquestion_order', subquestion.subquestion_order)
          .select('id');

      if (updateSubquestionError) {
        return sendTypedError(res, 500, API_ERROR_UPDATE_FAILED);
      }

      if ((updatedSubquestionRows?.length ?? 0) > 0) {
        continue;
      }

      const { error: insertSubquestionError } = await supabase
        .from('feedback_question_subquestions')
        .insert({
          question_id: questionId,
          subquestion_order: subquestion.subquestion_order,
          subquestion_text: subquestion.subquestion_text,
          is_active: subquestion.is_active,
        });

      if (insertSubquestionError) {
        return sendTypedError(res, 500, API_ERROR_UPDATE_FAILED);
      }
    }
  }

  const questionsSnapshot = await getCatalogQuestionsSnapshot({
    supabase,
    enterpriseId: enterprise.id,
    kind: catalogKind,
    catalogItemIds: [catalogItem.id],
  });

  if (questionsSnapshot.error) {
    return sendTypedError(res, 500, API_ERROR_UPDATE_FAILED);
  }

  return res.json({
    catalog_item_id: catalogItem.id,
    questions: questionsSnapshot.snapshotByCatalogItem.get(catalogItem.id) ?? [],
  });
}

export async function enableCatalogQrHandler(req: Request, res: Response) {
  const catalogItemId = String(req.body?.catalog_item_id ?? '').trim();
  if (!catalogItemId) {
    return sendTypedError(res, 400, API_ERROR_COLLECTION_POINT_ERROR);
  }

  const supabase = req.supabase!;
  const user = req.user!;

  const { data: enterprise, error: enterpriseError } = await supabase
    .from('enterprise')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (enterpriseError || !enterprise) {
    return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
  }

  const { data: catalogItem, error: catalogItemError } = await supabase
    .from('catalog_items')
    .select('id, name')
    .eq('id', catalogItemId)
    .eq('enterprise_id', enterprise.id)
    .eq('status', 'ACTIVE')
    .maybeSingle();

  if (catalogItemError || !catalogItem) {
    return sendTypedError(res, 404, API_ERROR_COLLECTION_POINT_ERROR);
  }

  const { data: activeCP } = await supabase
    .from('collection_points')
    .select('id')
    .eq('enterprise_id', enterprise.id)
    .eq('type', 'QR_CODE')
    .eq('catalog_item_id', catalogItem.id)
    .eq('status', 'ACTIVE')
    .maybeSingle();

  if (activeCP) {
    return res.json({
      catalog_item_id: catalogItem.id,
      collection_point_id: activeCP.id,
      active: true,
    });
  }

  const { data: anyCP } = await supabase
    .from('collection_points')
    .select('id')
    .eq('enterprise_id', enterprise.id)
    .eq('type', 'QR_CODE')
    .eq('catalog_item_id', catalogItem.id)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (anyCP) {
    const { error: updErr } = await supabase
      .from('collection_points')
      .update({ status: 'ACTIVE', name: `QR Code - ${catalogItem.name}` })
      .eq('id', anyCP.id);

    if (updErr) {
      return sendTypedError(res, 500, API_ERROR_UNABLE_TO_ACTIVATE_QR);
    }

    return res.json({
      catalog_item_id: catalogItem.id,
      collection_point_id: anyCP.id,
      active: true,
    });
  }

  const { data: newCP, error: createErr } = await supabase
    .from('collection_points')
    .insert({
      enterprise_id: enterprise.id,
      catalog_item_id: catalogItem.id,
      type: 'QR_CODE',
      status: 'ACTIVE',
      name: `QR Code - ${catalogItem.name}`,
    })
    .select('id')
    .single();

  if (createErr || !newCP) {
    return sendTypedError(res, 500, API_ERROR_UNABLE_TO_CREATE_QR_CP);
  }

  return res.json({
    catalog_item_id: catalogItem.id,
    collection_point_id: newCP.id,
    active: true,
  });
}

export async function disableCatalogQrHandler(req: Request, res: Response) {
  const catalogItemId = String(req.body?.catalog_item_id ?? '').trim();
  if (!catalogItemId) {
    return sendTypedError(res, 400, API_ERROR_COLLECTION_POINT_ERROR);
  }

  const supabase = req.supabase!;
  const user = req.user!;

  const { data: enterprise, error: enterpriseError } = await supabase
    .from('enterprise')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (enterpriseError || !enterprise) {
    return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
  }

  const { error: updErr } = await supabase
    .from('collection_points')
    .update({ status: 'INACTIVE' })
    .eq('enterprise_id', enterprise.id)
    .eq('type', 'QR_CODE')
    .eq('catalog_item_id', catalogItemId)
    .eq('status', 'ACTIVE');

  if (updErr) {
    return sendTypedError(res, 500, API_ERROR_UNABLE_TO_DISABLE_QR);
  }

  return res.json({
    catalog_item_id: catalogItemId,
    active: false,
  });
}

