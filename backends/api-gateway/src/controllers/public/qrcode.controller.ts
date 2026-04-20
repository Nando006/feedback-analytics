import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import { qrcodeFeedbackSchema } from '../../../../../shared/schemas/public/feedbackSchema.js';
import { createSupabaseServerClient } from '../../config/supabase.js';
import {
  API_ERROR_COLLECTION_POINT_ERROR,
  API_ERROR_COLLECTION_POINT_NOT_FOUND,
  API_ERROR_DEVICE_ALREADY_SUBMITTED,
  API_ERROR_DEVICE_BLOCKED,
  API_ERROR_DEVICE_CHECK_FAILED,
  API_ERROR_DEVICE_CREATION_FAILED,
  API_ERROR_ENTERPRISE_NOT_FOUND,
  API_ERROR_FEEDBACK_INSERT_FAILED,
  API_ERROR_INVALID_PAYLOAD,
} from '../../config/errors.js';
import { sendTypedError } from '../../utils/sendTypedError.js';

function mapAnswerScore(answerValue: string): number {
  switch (answerValue) {
    case 'PESSIMO': return 1;
    case 'RUIM': return 2;
    case 'MEDIANA': return 3;
    case 'BOA': return 4;
    case 'OTIMA': return 5;
    default: return 0;
  }
}

export async function submitQrCodeFeedbackController(req: Request, res: Response) {
  const parsed = qrcodeFeedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
  }

  const payload = parsed.data;
  const supabase = createSupabaseServerClient(req, res);

  const { data: enterpriseRow, error: enterpriseErr } = await supabase
    .from('enterprise_public')
    .select('id')
    .eq('id', payload.enterprise_id)
    .single();

  if (enterpriseErr || !enterpriseRow) {
    return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
  }

  const userAgent = req.get('user-agent') || '';
  const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayEpoch = Math.floor(today.getTime() / 1000);

  const fingerprintData = `${userAgent}|${clientIP}|${dayEpoch}`;
  const deviceFingerprint = crypto.createHash('md5').update(fingerprintData).digest('hex');

  let cpQuery = supabase
    .from('collection_points')
    .select('id, name, catalog_item_id, catalog_items(kind)')
    .eq('enterprise_id', payload.enterprise_id)
    .eq('type', 'QR_CODE')
    .eq('status', 'ACTIVE');

  if (payload.collection_point_id) {
    cpQuery = cpQuery.eq('id', payload.collection_point_id);
  } else if (payload.catalog_item_id) {
    cpQuery = cpQuery.eq('catalog_item_id', payload.catalog_item_id);
  } else {
    cpQuery = cpQuery.is('catalog_item_id', null);
  }

  const { data: collectionPoint, error: cpErr } = await cpQuery.maybeSingle();

  if (cpErr) {
    console.error('Erro ao buscar collection_point:', cpErr);
    return sendTypedError(res, 500, API_ERROR_COLLECTION_POINT_ERROR);
  }

  if (!collectionPoint) {
    return sendTypedError(res, 404, API_ERROR_COLLECTION_POINT_NOT_FOUND);
  }

  const cpCatalogItem = Array.isArray(collectionPoint.catalog_items)
    ? collectionPoint.catalog_items[0]
    : collectionPoint.catalog_items;

  const contextScope: 'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT' =
    cpCatalogItem?.kind === 'PRODUCT' ||
    cpCatalogItem?.kind === 'SERVICE' ||
    cpCatalogItem?.kind === 'DEPARTMENT'
      ? cpCatalogItem.kind
      : 'COMPANY';

  const fetchQuestions = async (
    scopeType: 'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT',
    catalogItemId: string | null,
  ) => {
    let query = supabase
      .from('questions_of_feedbacks')
      .select(
        'id, question_order, question_text, subquestions:feedback_question_subquestions(id, question_id, subquestion_order, subquestion_text, is_active)',
      )
      .eq('enterprise_id', payload.enterprise_id)
      .eq('scope_type', scopeType)
      .eq('is_active', true)
      .order('question_order', { ascending: true });

    if (scopeType === 'COMPANY') {
      query = query.is('catalog_item_id', null);
    } else {
      query = catalogItemId
        ? query.eq('catalog_item_id', catalogItemId)
        : query.is('catalog_item_id', null);
    }

    return await query;
  };

  let { data: currentQuestions, error: currentQuestionsError } =
    await fetchQuestions(contextScope, collectionPoint.catalog_item_id ?? null);

  if (
    !currentQuestionsError &&
    contextScope !== 'COMPANY' &&
    (!currentQuestions || currentQuestions.length < 3)
  ) {
    const fallback = await fetchQuestions('COMPANY', null);
    currentQuestions = fallback.data;
    currentQuestionsError = fallback.error;
  }

  const normalizedQuestions = (currentQuestions ?? []).map((question) => ({
    id: String(question.id),
    question_order: Number(question.question_order),
    question_text: String(question.question_text ?? ''),
    subquestions: Array.isArray(question.subquestions)
      ? question.subquestions
          .filter((subquestion) => subquestion?.is_active === true)
          .map((subquestion) => ({
            id: String(subquestion.id),
            question_id: String(subquestion.question_id),
            subquestion_order: Number(subquestion.subquestion_order),
            subquestion_text: String(subquestion.subquestion_text ?? ''),
          }))
          .sort((left, right) => left.subquestion_order - right.subquestion_order)
      : [],
  }));

  if (currentQuestionsError || normalizedQuestions.length !== 3) {
    console.error('Perguntas não configuradas para o contexto do feedback:', currentQuestionsError);
    return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
  }

  const allowedQuestionIds = new Set(normalizedQuestions.map((question) => question.id));
  const payloadQuestionIds = payload.answers.map((answer) => answer.question_id);

  if (
    payload.answers.length !== 3 ||
    new Set(payloadQuestionIds).size !== 3 ||
    payloadQuestionIds.some((questionId) => !allowedQuestionIds.has(questionId))
  ) {
    return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
  }

  const activeSubquestions = normalizedQuestions.flatMap((question) => question.subquestions);
  const payloadSubanswers = payload.subanswers ?? [];
  const allowedSubquestionIds = new Set(activeSubquestions.map((subquestion) => subquestion.id));
  const payloadSubquestionIds = payloadSubanswers.map((subanswer) => subanswer.subquestion_id);

  if (
    payloadSubanswers.length !== activeSubquestions.length ||
    new Set(payloadSubquestionIds).size !== payloadSubanswers.length ||
    payloadSubquestionIds.some((subquestionId) => !allowedSubquestionIds.has(subquestionId))
  ) {
    return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
  }

  const { data: initialTrackedDevice, error: deviceErr } = await supabase
    .from('tracked_devices')
    .select('id, last_feedback_at, is_blocked, feedback_count, customer_id')
    .eq('enterprise_id', payload.enterprise_id)
    .eq('device_fingerprint', deviceFingerprint)
    .maybeSingle();

  let trackedDevice = initialTrackedDevice;

  if (deviceErr) {
    console.error('Erro ao verificar dispositivo:', deviceErr);
    return sendTypedError(res, 500, API_ERROR_DEVICE_CHECK_FAILED);
  }

  if (trackedDevice?.is_blocked) {
    console.log('Dispositivo bloqueado');
    return sendTypedError(res, 403, API_ERROR_DEVICE_BLOCKED);
  }

  if (trackedDevice?.id) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: duplicateFeedback, error: duplicateFeedbackErr } = await supabase
      .from('feedback')
      .select('id')
      .eq('tracked_device_id', trackedDevice.id)
      .eq('collection_point_id', collectionPoint.id)
      .gte('created_at', todayStart.toISOString())
      .limit(1)
      .maybeSingle();

    if (duplicateFeedbackErr) {
      console.error('Erro ao verificar feedback duplicado por QR:', duplicateFeedbackErr);
      return sendTypedError(res, 500, API_ERROR_DEVICE_CHECK_FAILED);
    }

    if (duplicateFeedback) {
      console.log('Dispositivo já enviou feedback hoje neste QR Code');
      return sendTypedError(res, 409, API_ERROR_DEVICE_ALREADY_SUBMITTED);
    }
  }

  let customerId: string | null = null;

  if (payload.customer_name || payload.customer_email) {
    let existingCustomer = null;
    if (payload.customer_email) {
      const { data: customerByEmail } = await supabase
        .from('customer')
        .select('id')
        .eq('enterprise_id', payload.enterprise_id)
        .eq('email', payload.customer_email)
        .maybeSingle();

      existingCustomer = customerByEmail;
    }

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      let genderForDB = null;
      if (payload.customer_gender) {
        const genderMap: Record<string, string> = {
          masculino: 'Masculino',
          feminino: 'Feminino',
          outro: 'Outro',
          prefiro_nao_informar: 'Não Informado',
        };
        genderForDB = genderMap[payload.customer_gender] || null;
      }

      const { data: newCustomer, error: customerErr } = await supabase
        .from('customer')
        .insert({
          enterprise_id: payload.enterprise_id,
          name: payload.customer_name || null,
          email: payload.customer_email || null,
          gender: genderForDB,
        })
        .select('id')
        .single();

      if (customerErr) {
        console.error('Erro ao criar cliente:', customerErr);
      } else if (newCustomer) {
        customerId = newCustomer.id;
      }
    }
  }

  if (!trackedDevice) {
    const { data: newDevice, error: createDeviceErr } = await supabase
      .from('tracked_devices')
      .insert({
        enterprise_id: payload.enterprise_id,
        customer_id: customerId,
        device_fingerprint: deviceFingerprint,
        user_agent: userAgent,
        ip_address: clientIP,
        last_feedback_at: new Date().toISOString(),
        feedback_count: 0,
        is_blocked: false,
      })
      .select('id, feedback_count, last_feedback_at, is_blocked, customer_id')
      .single();

    if (createDeviceErr || !newDevice) {
      console.error('Erro ao criar dispositivo:', createDeviceErr);
      return sendTypedError(res, 500, API_ERROR_DEVICE_CREATION_FAILED);
    }

    trackedDevice = newDevice;
  } else if (customerId && !trackedDevice.customer_id) {
    await supabase
      .from('tracked_devices')
      .update({ customer_id: customerId })
      .eq('id', trackedDevice.id);
  }

  const feedbackId = crypto.randomUUID();

  const { error: feedbackErr } = await supabase.from('feedback').insert({
    id: feedbackId,
    enterprise_id: payload.enterprise_id,
    collection_point_id: collectionPoint.id,
    tracked_device_id: trackedDevice.id,
    message: payload.message,
    rating: payload.rating,
  });

  if (feedbackErr) {
    console.error('Erro ao inserir feedback:', feedbackErr);
    return sendTypedError(res, 500, API_ERROR_FEEDBACK_INSERT_FAILED);
  }

  const questionById = new Map(normalizedQuestions.map((question) => [question.id, question]));
  const subquestionById = new Map(activeSubquestions.map((subquestion) => [subquestion.id, subquestion]));

  const answerRows = payload.answers.map((answer) => {
    const question = questionById.get(answer.question_id);
    const answerScore = mapAnswerScore(answer.answer_value);

    return {
      feedback_id: feedbackId,
      question_id: answer.question_id,
      question_text_snapshot: question?.question_text ?? '',
      answer_value: answer.answer_value,
      answer_score: answerScore,
    };
  });

  const subanswerRows = payloadSubanswers.map((subanswer) => {
    const subquestion = subquestionById.get(subanswer.subquestion_id);
    const answerScore = mapAnswerScore(subanswer.answer_value);

    return {
      feedback_id: feedbackId,
      subquestion_id: subanswer.subquestion_id,
      subquestion_text_snapshot: subquestion?.subquestion_text ?? '',
      answer_value: subanswer.answer_value,
      answer_score: answerScore,
    };
  });

  if (
    answerRows.some((answerRow) => answerRow.answer_score === 0) ||
    subanswerRows.some((subanswerRow) => subanswerRow.answer_score === 0)
  ) {
    return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
  }

  const { error: answersError } = await supabase
    .from('feedback_question_answers')
    .insert(answerRows);

  if (answersError) {
    console.error('Erro ao inserir respostas do feedback:', answersError);
    await supabase.from('feedback').delete().eq('id', feedbackId);
    return sendTypedError(res, 500, API_ERROR_FEEDBACK_INSERT_FAILED);
  }

  if (subanswerRows.length > 0) {
    const { error: subanswersError } = await supabase
      .from('feedback_subquestion_answers')
      .insert(subanswerRows);

    if (subanswersError) {
      console.error('Erro ao inserir respostas de subperguntas do feedback:', subanswersError);
      await supabase.from('feedback').delete().eq('id', feedbackId);
      return sendTypedError(res, 500, API_ERROR_FEEDBACK_INSERT_FAILED);
    }
  }

  const { error: updateErr } = await supabase
    .from('tracked_devices')
    .update({
      last_feedback_at: new Date().toISOString(),
      feedback_count: (trackedDevice.feedback_count || 0) + 1,
      user_agent: userAgent,
      ip_address: clientIP,
    })
    .eq('id', trackedDevice.id);

  if (updateErr) {
    console.error('Erro ao atualizar dispositivo:', updateErr);
  }

  return res.json({ ok: true });
}
