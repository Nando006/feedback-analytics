import type {
  CatalogItemInput,
  CompanyFeedbackQuestionInput,
} from 'lib/interfaces/entities/enterprise.entity';
import {
  INTENT_FEEDBACK_SETTINGS_SAVE_COMPANY_QUESTIONS,
  INTENT_FEEDBACK_SETTINGS_SAVE_DEPARTMENTS_CATALOG,
  INTENT_FEEDBACK_SETTINGS_SAVE_PRODUCTS_CATALOG,
  INTENT_FEEDBACK_SETTINGS_SAVE_SERVICES_CATALOG,
} from 'src/lib/constants/routes/intents';
import { ServiceUpdateCollectingDataEnterprise } from 'src/services/serviceEnterprise';
import type { ActionFunctionArgs } from 'react-router-dom';

type HttpError = Error & {
  status?: number;
  code?: string;
};

type FeedbackSettingsIntent =
  | typeof INTENT_FEEDBACK_SETTINGS_SAVE_COMPANY_QUESTIONS
  | typeof INTENT_FEEDBACK_SETTINGS_SAVE_PRODUCTS_CATALOG
  | typeof INTENT_FEEDBACK_SETTINGS_SAVE_SERVICES_CATALOG
  | typeof INTENT_FEEDBACK_SETTINGS_SAVE_DEPARTMENTS_CATALOG;

const MIN_QUESTION_LENGTH = 20;
const MAX_QUESTION_LENGTH = 150;

function hasValidQuestionLength(text: string) {
  return text.length >= MIN_QUESTION_LENGTH && text.length <= MAX_QUESTION_LENGTH;
}

function getErrorMessage(err: unknown) {
  if (err && typeof err === 'object' && 'message' in err) {
    return String(err.message);
  }

  return 'Falha ao salvar configurações de feedback. Tente novamente.';
}

function parseCatalogItemsField(
  raw: FormDataEntryValue | null,
): CatalogItemInput[] | null {
  if (raw === null) {
    return [];
  }

  const text = String(raw ?? '').trim();
  if (!text) {
    return [];
  }

  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed
      .map((item, index) => {
        if (!item || typeof item !== 'object') {
          return null;
        }

        const candidate = item as {
          id?: unknown;
          name?: unknown;
          description?: unknown;
          sort_order?: unknown;
          status?: unknown;
        };

        const name =
          typeof candidate.name === 'string' ? candidate.name.trim() : '';

        if (!name) {
          return null;
        }

        const normalizedItem: CatalogItemInput = {
          ...(typeof candidate.id === 'string' && candidate.id.trim()
            ? { id: candidate.id.trim() }
            : {}),
          name,
          description:
            typeof candidate.description === 'string'
              ? candidate.description.trim() || null
              : null,
          sort_order:
            typeof candidate.sort_order === 'number' &&
            Number.isFinite(candidate.sort_order)
              ? candidate.sort_order
              : index,
          status:
            candidate.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        };

        return normalizedItem;
      })
      .filter((item): item is CatalogItemInput => item !== null);
  } catch {
    return null;
  }
}

function parseCompanyFeedbackQuestionsField(
  raw: FormDataEntryValue | null,
): CompanyFeedbackQuestionInput[] | null {
  const text = String(raw ?? '').trim();

  if (!text) {
    return null;
  }

  try {
    const parsed = JSON.parse(text) as unknown;

    if (!Array.isArray(parsed) || parsed.length !== 3) {
      return null;
    }

    const questionOrders = new Set<number>();

    const normalizedQuestions = parsed.map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const candidate = item as {
        question_order?: unknown;
        question_text?: unknown;
        is_active?: unknown;
        subquestions?: unknown;
      };

      const questionOrderRaw = Number(candidate.question_order);
      const questionOrder =
        Number.isInteger(questionOrderRaw) &&
        questionOrderRaw >= 1 &&
        questionOrderRaw <= 3
          ? (questionOrderRaw as 1 | 2 | 3)
          : ((index + 1) as 1 | 2 | 3);

      if (questionOrders.has(questionOrder)) {
        return null;
      }

      questionOrders.add(questionOrder);

      const questionText =
        typeof candidate.question_text === 'string'
          ? candidate.question_text.trim()
          : '';

      if (!hasValidQuestionLength(questionText)) {
        return null;
      }

      const rawSubquestions = Array.isArray(candidate.subquestions)
        ? candidate.subquestions
        : [];

      const subquestionOrders = new Set<number>();

      const normalizedSubquestions = rawSubquestions
        .slice(0, 3)
        .map((subquestion, subIndex) => {
          if (!subquestion || typeof subquestion !== 'object') {
            return null;
          }

          const subquestionCandidate = subquestion as {
            subquestion_order?: unknown;
            subquestion_text?: unknown;
            is_active?: unknown;
          };

          const subquestionOrderRaw = Number(subquestionCandidate.subquestion_order);
          const subquestionOrder =
            Number.isInteger(subquestionOrderRaw) &&
            subquestionOrderRaw >= 1 &&
            subquestionOrderRaw <= 3
              ? (subquestionOrderRaw as 1 | 2 | 3)
              : ((subIndex + 1) as 1 | 2 | 3);

          if (subquestionOrders.has(subquestionOrder)) {
            return null;
          }

          subquestionOrders.add(subquestionOrder);

          const subquestionText =
            typeof subquestionCandidate.subquestion_text === 'string'
              ? subquestionCandidate.subquestion_text.trim()
              : '';

          const isActive = subquestionCandidate.is_active === true;

          if (!subquestionText) {
            if (isActive) {
              return null;
            }

            return {
              subquestion_order: subquestionOrder,
              subquestion_text: '',
              is_active: false,
            };
          }

          if (!hasValidQuestionLength(subquestionText)) {
            return null;
          }

          return {
            subquestion_order: subquestionOrder,
            subquestion_text: subquestionText,
            is_active: isActive,
          };
        })
        .filter(
          (
            subquestion,
          ): subquestion is NonNullable<typeof subquestion> => Boolean(subquestion),
        );

      if (normalizedSubquestions.length !== rawSubquestions.slice(0, 3).length) {
        return null;
      }

      return {
        question_order: questionOrder,
        question_text: questionText,
        is_active: candidate.is_active === false ? false : true,
        subquestions: normalizedSubquestions,
      };
    });

    if (normalizedQuestions.some((question) => question === null)) {
      return null;
    }

    return normalizedQuestions as CompanyFeedbackQuestionInput[];
  } catch {
    return null;
  }
}

export async function ActionFeedbackSettings({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '') as FeedbackSettingsIntent;

  if (
    intent !== INTENT_FEEDBACK_SETTINGS_SAVE_COMPANY_QUESTIONS &&
    intent !== INTENT_FEEDBACK_SETTINGS_SAVE_PRODUCTS_CATALOG &&
    intent !== INTENT_FEEDBACK_SETTINGS_SAVE_SERVICES_CATALOG &&
    intent !== INTENT_FEEDBACK_SETTINGS_SAVE_DEPARTMENTS_CATALOG
  ) {
    return new Response(JSON.stringify({ error: 'Ação inválida.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    if (intent === INTENT_FEEDBACK_SETTINGS_SAVE_COMPANY_QUESTIONS) {
      const questions = parseCompanyFeedbackQuestionsField(
        form.get('company_feedback_questions'),
      );

      if (!questions) {
        return new Response(
          JSON.stringify({
            error: 'Perguntas da empresa inválidas. Verifique o preenchimento.',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      const collecting = await ServiceUpdateCollectingDataEnterprise({
        company_feedback_questions: questions,
      });

      return new Response(
        JSON.stringify({
          ok: true,
          scope: 'COMPANY',
          message: 'Perguntas da empresa atualizadas com sucesso.',
          collecting,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const catalogItems = parseCatalogItemsField(form.get('catalog_items'));

    if (!catalogItems) {
      return new Response(
        JSON.stringify({ error: 'Itens de catálogo inválidos.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (intent === INTENT_FEEDBACK_SETTINGS_SAVE_PRODUCTS_CATALOG) {
      const collecting = await ServiceUpdateCollectingDataEnterprise({
        uses_company_products: true,
        catalog_products: catalogItems,
        main_products_or_services: catalogItems.map((item) => item.name),
      });

      return new Response(
        JSON.stringify({
          ok: true,
          scope: 'PRODUCT',
          message: 'Catálogo de produtos atualizado com sucesso.',
          collecting,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (intent === INTENT_FEEDBACK_SETTINGS_SAVE_SERVICES_CATALOG) {
      const collecting = await ServiceUpdateCollectingDataEnterprise({
        uses_company_services: true,
        catalog_services: catalogItems,
      });

      return new Response(
        JSON.stringify({
          ok: true,
          scope: 'SERVICE',
          message: 'Catálogo de serviços atualizado com sucesso.',
          collecting,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const collecting = await ServiceUpdateCollectingDataEnterprise({
      uses_company_departments: true,
      catalog_departments: catalogItems,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        scope: 'DEPARTMENT',
        message: 'Catálogo de departamentos atualizado com sucesso.',
        collecting,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    const httpError = error as HttpError;

    return new Response(
      JSON.stringify({
        error: httpError?.code || 'upsert_failed',
        message: getErrorMessage(httpError),
      }),
      {
        status:
          typeof httpError?.status === 'number' &&
          httpError.status >= 400 &&
          httpError.status <= 599
            ? httpError.status
            : 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
