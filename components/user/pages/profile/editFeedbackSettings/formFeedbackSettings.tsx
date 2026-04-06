import type {
  CatalogItemInput,
  CollectingDataEnterprise,
  CompanyFeedbackQuestionInput,
} from 'lib/interfaces/entities/enterprise.entity';
import {
  INTENT_FEEDBACK_SETTINGS_SAVE_COMPANY_QUESTIONS,
  INTENT_FEEDBACK_SETTINGS_SAVE_DEPARTMENTS_CATALOG,
  INTENT_FEEDBACK_SETTINGS_SAVE_PRODUCTS_CATALOG,
  INTENT_FEEDBACK_SETTINGS_SAVE_SERVICES_CATALOG,
} from 'lib/constants/routes/intents';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type FormEvent,
} from 'react';
import { Form, Link, useRouteLoaderData } from 'react-router-dom';
import FieldCatalogItems from '../editCollectingData/fields/fieldCatalogItems';
import type { FeedbackTab } from './ui.types';

const TOTAL_QUESTIONS = 3;
const TOTAL_SUBQUESTIONS = 3;
const MIN_QUESTION_LENGTH = 20;
const MAX_QUESTION_LENGTH = 150;

const DEFAULT_COMPANY_QUESTIONS: Array<{ question_order: 1 | 2 | 3; question_text: string }> = [
  {
    question_order: 1,
    question_text: 'Como foi sua experiência em relação ao atendimento?',
  },
  {
    question_order: 2,
    question_text: 'O que você achou da qualidade do produto/serviço?',
  },
  {
    question_order: 3,
    question_text:
      'Como você avalia a relação entre o valor pago e a qualidade do produto/serviço?',
  },
];

function hasValidQuestionLength(text: string) {
  return text.length >= MIN_QUESTION_LENGTH && text.length <= MAX_QUESTION_LENGTH;
}

function createEmptySubquestion(subquestionOrder: 1 | 2 | 3) {
  return {
    subquestion_order: subquestionOrder,
    subquestion_text: '',
    is_active: false,
  };
}

function normalizeCatalogInput(items: CatalogItemInput[] | undefined) {
  return (items ?? []).map((item, index) => ({
    ...(item.id ? { id: item.id } : {}),
    name: item.name ?? '',
    description: item.description ?? '',
    status: item.status ?? 'ACTIVE',
    sort_order:
      typeof item.sort_order === 'number' && Number.isFinite(item.sort_order)
        ? item.sort_order
        : index,
  }));
}

function normalizeCompanyFeedbackQuestions(
  items: CollectingDataEnterprise['company_feedback_questions'] | undefined,
): CompanyFeedbackQuestionInput[] {
  const byOrder = new Map<number, CompanyFeedbackQuestionInput>();

  (items ?? []).forEach((item) => {
    const order = Number(item.question_order);

    if (!Number.isInteger(order) || order < 1 || order > 3) {
      return;
    }

    const subquestionByOrder = new Map<number, { subquestion_text: string; is_active: boolean }>();

    (item.subquestions ?? []).forEach((subquestion) => {
      const subOrder = Number(subquestion.subquestion_order);
      if (!Number.isInteger(subOrder) || subOrder < 1 || subOrder > 3) {
        return;
      }

      subquestionByOrder.set(subOrder, {
        subquestion_text: String(subquestion.subquestion_text ?? ''),
        is_active: subquestion.is_active === true,
      });
    });

    byOrder.set(order, {
      question_order: order as 1 | 2 | 3,
      question_text: item.question_text ?? '',
      is_active: item.is_active ?? true,
      subquestions: Array.from({ length: TOTAL_SUBQUESTIONS }, (_, subIndex) => {
        const subOrder = (subIndex + 1) as 1 | 2 | 3;
        const currentSubquestion = subquestionByOrder.get(subOrder);

        return {
          subquestion_order: subOrder,
          subquestion_text: currentSubquestion?.subquestion_text ?? '',
          is_active: currentSubquestion?.is_active ?? false,
        };
      }),
    });
  });

  return Array.from({ length: TOTAL_QUESTIONS }, (_, index) => {
    const questionOrder = (index + 1) as 1 | 2 | 3;
    const current = byOrder.get(questionOrder);

    return {
      question_order: questionOrder,
      question_text:
        current?.question_text ??
        DEFAULT_COMPANY_QUESTIONS[index]?.question_text ??
        '',
      is_active: current?.is_active ?? true,
      subquestions:
        current?.subquestions ??
        [
          createEmptySubquestion(1),
          createEmptySubquestion(2),
          createEmptySubquestion(3),
        ],
    };
  });
}

function validateCompanyQuestions(questions: CompanyFeedbackQuestionInput[]) {
  if (questions.length !== TOTAL_QUESTIONS) {
    return 'A empresa precisa ter exatamente 3 perguntas principais.';
  }

  for (const question of questions) {
    const questionText = String(question.question_text ?? '').trim();

    if (!hasValidQuestionLength(questionText)) {
      return 'Cada pergunta da empresa deve ter entre 20 e 150 caracteres.';
    }

    const subquestions = question.subquestions ?? [];

    if (subquestions.length > TOTAL_SUBQUESTIONS) {
      return 'Cada pergunta da empresa aceita no máximo 3 subperguntas.';
    }

    for (const subquestion of subquestions) {
      const subquestionText = String(subquestion.subquestion_text ?? '').trim();
      const isActive = subquestion.is_active === true;

      if (!subquestionText) {
        if (isActive) {
          return 'Subperguntas ativas precisam ter texto válido.';
        }

        continue;
      }

      if (!hasValidQuestionLength(subquestionText)) {
        return 'Cada subpergunta da empresa deve ter entre 20 e 150 caracteres.';
      }
    }
  }

  return null;
}

export default function FormFeedbackSettings() {
  const { collecting } = useRouteLoaderData('user') as {
    collecting: CollectingDataEnterprise | null;
  };

  const productsEnabled = collecting?.uses_company_products === true;
  const servicesEnabled = collecting?.uses_company_services === true;
  const departmentsEnabled = collecting?.uses_company_departments === true;

  const [activeTab, setActiveTab] = useState<FeedbackTab>('COMPANY');
  const [companyError, setCompanyError] = useState<string | null>(null);

  const [productItems, setProductItems] = useState<CatalogItemInput[]>(() =>
    normalizeCatalogInput(collecting?.catalog_products),
  );
  const [serviceItems, setServiceItems] = useState<CatalogItemInput[]>(() =>
    normalizeCatalogInput(collecting?.catalog_services),
  );
  const [departmentItems, setDepartmentItems] = useState<CatalogItemInput[]>(() =>
    normalizeCatalogInput(collecting?.catalog_departments),
  );

  const [companyQuestions, setCompanyQuestions] = useState<CompanyFeedbackQuestionInput[]>(
    () => normalizeCompanyFeedbackQuestions(collecting?.company_feedback_questions),
  );

  const productsInputRef = useRef<HTMLInputElement | null>(null);
  const servicesInputRef = useRef<HTMLInputElement | null>(null);
  const departmentsInputRef = useRef<HTMLInputElement | null>(null);
  const companyQuestionsInputRef = useRef<HTMLInputElement | null>(null);

  const handleCatalogSubmit = useCallback((items: CatalogItemInput[], ref: RefObject<HTMLInputElement | null>) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (ref.current) {
      ref.current.value = JSON.stringify(items);
    }
  }, []);

  const handleCompanySubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      const validationMessage = validateCompanyQuestions(companyQuestions);

      if (validationMessage) {
        event.preventDefault();
        setCompanyError(validationMessage);
        return;
      }

      setCompanyError(null);

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      if (companyQuestionsInputRef.current) {
        companyQuestionsInputRef.current.value = JSON.stringify(
          companyQuestions.map((question, index) => ({
            question_order: (index + 1) as 1 | 2 | 3,
            question_text: String(question.question_text ?? '').trim(),
            is_active: question.is_active ?? true,
            subquestions: (question.subquestions ?? []).map((subquestion, subIndex) => ({
              subquestion_order: (subIndex + 1) as 1 | 2 | 3,
              subquestion_text: String(subquestion.subquestion_text ?? '').trim(),
              is_active: subquestion.is_active === true,
            })),
          })),
        );
      }
    },
    [companyQuestions],
  );

  const tabs = useMemo(
    () => [
      {
        id: 'COMPANY' as const,
        label: 'Empresa',
        isEnabled: true,
      },
      {
        id: 'PRODUCT' as const,
        label: 'Produtos',
        isEnabled: productsEnabled,
      },
      {
        id: 'SERVICE' as const,
        label: 'Serviços',
        isEnabled: servicesEnabled,
      },
      {
        id: 'DEPARTMENT' as const,
        label: 'Departamentos',
        isEnabled: departmentsEnabled,
      },
    ],
    [productsEnabled, servicesEnabled, departmentsEnabled],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-xl border border-(--quaternary-color)/10 bg-(--bg-tertiary) p-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? (tab.isEnabled
                      ? 'bg-(--primary-color) text-white'
                      : 'bg-amber-500/10 text-amber-300')
                  : (tab.isEnabled
                      ? 'text-(--text-secondary) hover:bg-(--primary-color)/10 hover:text-(--text-primary)'
                      : 'text-(--text-tertiary) hover:bg-amber-500/6 hover:text-amber-300')
              }`}
            >
              {tab.label}{tab.isEnabled ? '' : ' (desativado)'}
            </button>
          );
        })}
      </div>

      {activeTab === 'COMPANY' && (
        <Form
          method="post"
          onSubmit={handleCompanySubmit}
          className="space-y-4"
        >
          <input
            type="hidden"
            name="intent"
            value={INTENT_FEEDBACK_SETTINGS_SAVE_COMPANY_QUESTIONS}
          />
          <input
            ref={companyQuestionsInputRef}
            type="hidden"
            name="company_feedback_questions"
            defaultValue="[]"
          />

          <div className="rounded-xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-4">
            <h3 className="text-base font-semibold text-(--text-primary)">
              Perguntas de Feedback da Empresa
            </h3>
            <p className="mt-1 text-sm text-(--text-tertiary)">
              Configure 3 perguntas principais da empresa, com até 3 subperguntas por pergunta.
            </p>
          </div>

          {companyQuestions.map((question, questionIndex) => {
            const questionTextLength = String(question.question_text ?? '').trim().length;

            return (
              <div
                key={`company-question-${question.question_order}`}
                className="rounded-xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-(--text-primary)">
                    Pergunta {question.question_order}
                  </p>
                  <label className="flex items-center gap-2 text-xs text-(--text-secondary)">
                    <input
                      type="checkbox"
                      checked={question.is_active ?? true}
                      onChange={(event) => {
                        const checked = event.target.checked;

                        setCompanyQuestions((previousQuestions) => {
                          const next = [...previousQuestions];
                          const current = next[questionIndex] ?? question;

                          next[questionIndex] = {
                            ...current,
                            is_active: checked,
                          };

                          return next;
                        });
                      }}
                    />
                    Ativa
                  </label>
                </div>

                <input
                  type="text"
                  value={question.question_text}
                  onChange={(event) => {
                    const value = event.target.value;

                    setCompanyQuestions((previousQuestions) => {
                      const next = [...previousQuestions];
                      const current = next[questionIndex] ?? question;

                      next[questionIndex] = {
                        ...current,
                        question_text: value,
                      };

                      return next;
                    });
                  }}
                  maxLength={MAX_QUESTION_LENGTH}
                  placeholder="Escreva a pergunta principal (20 a 150 caracteres)"
                  className="w-full rounded-lg border border-(--quaternary-color)/14 bg-(--bg-tertiary) px-3 py-2 text-sm text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
                />

                <p className="mt-1 text-[11px] text-(--text-tertiary)">
                  {questionTextLength}/{MAX_QUESTION_LENGTH} caracteres
                </p>

                <div className="mt-3 space-y-2">
                  {(question.subquestions ?? []).map((subquestion, subquestionIndex) => {
                    const subquestionTextLength = String(
                      subquestion.subquestion_text ?? '',
                    ).trim().length;

                    return (
                      <div
                        key={`company-subquestion-${question.question_order}-${subquestion.subquestion_order}`}
                        className="rounded-lg border border-(--quaternary-color)/10 bg-(--bg-tertiary) p-3"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-(--text-primary)">
                            Subpergunta {question.question_order}.{subquestion.subquestion_order}
                          </p>
                          <label className="flex items-center gap-2 text-[11px] text-(--text-secondary)">
                            <input
                              type="checkbox"
                              checked={subquestion.is_active === true}
                              onChange={(event) => {
                                const checked = event.target.checked;

                                setCompanyQuestions((previousQuestions) => {
                                  const next = [...previousQuestions];
                                  const currentQuestion = next[questionIndex] ?? question;
                                  const currentSubquestions = [
                                    ...(currentQuestion.subquestions ?? []),
                                  ];
                                  const currentSubquestion =
                                    currentSubquestions[subquestionIndex] ?? subquestion;

                                  currentSubquestions[subquestionIndex] = {
                                    ...currentSubquestion,
                                    is_active: checked,
                                  };

                                  next[questionIndex] = {
                                    ...currentQuestion,
                                    subquestions: currentSubquestions,
                                  };

                                  return next;
                                });
                              }}
                            />
                            Ativa
                          </label>
                        </div>

                        <input
                          type="text"
                          value={subquestion.subquestion_text}
                          onChange={(event) => {
                            const value = event.target.value;

                            setCompanyQuestions((previousQuestions) => {
                              const next = [...previousQuestions];
                              const currentQuestion = next[questionIndex] ?? question;
                              const currentSubquestions = [
                                ...(currentQuestion.subquestions ?? []),
                              ];
                              const currentSubquestion =
                                currentSubquestions[subquestionIndex] ?? subquestion;

                              currentSubquestions[subquestionIndex] = {
                                ...currentSubquestion,
                                subquestion_text: value,
                              };

                              next[questionIndex] = {
                                ...currentQuestion,
                                subquestions: currentSubquestions,
                              };

                              return next;
                            });
                          }}
                          maxLength={MAX_QUESTION_LENGTH}
                          placeholder="Escreva a subpergunta (20 a 150 caracteres)"
                          className="w-full rounded-lg border border-(--quaternary-color)/14 bg-(--bg-secondary) px-3 py-2 text-xs text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color)"
                        />

                        <p className="mt-1 text-[10px] text-(--text-tertiary)">
                          {subquestionTextLength}/{MAX_QUESTION_LENGTH} caracteres
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {companyError && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {companyError}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary font-poppins px-6 py-3 text-sm"
          >
            Salvar Perguntas da Empresa
          </button>
        </Form>
      )}

      {activeTab === 'PRODUCT' && (
        !productsEnabled ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <h3 className="text-sm font-semibold text-amber-200">
              Produtos desativados nas Informações Gerais
            </h3>
            <p className="mt-1 text-xs text-amber-100/90">
              Habilite o uso de produtos para editar catálogo e perguntas por item.
            </p>
            <Link
              to="/user/edit/collecting-data-enterprise"
              className="mt-3 inline-flex rounded-lg border border-amber-400/50 px-3 py-2 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-500/15"
            >
              Ir para Informações Gerais
            </Link>
          </div>
        ) : (
        <Form
          method="post"
          onSubmit={() => handleCatalogSubmit(productItems, productsInputRef)}
          className="space-y-4"
        >
          <input
            type="hidden"
            name="intent"
            value={INTENT_FEEDBACK_SETTINGS_SAVE_PRODUCTS_CATALOG}
          />
          <input
            ref={productsInputRef}
            type="hidden"
            name="catalog_items"
            defaultValue="[]"
          />

          <div className="rounded-xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-4">
            <p className="text-sm text-(--text-secondary)">
              {productItems.length > 0
                ? `Você possui ${productItems.length} produto(s) no catálogo.`
                : 'Você ainda não possui produtos cadastrados neste tipo.'}
            </p>
            <p className="mt-1 text-xs text-(--text-tertiary)">
              Após salvar o catálogo, configure as perguntas de cada item na tela de QR Codes por produto.
            </p>
          </div>

          <FieldCatalogItems
            title="Catálogo de Produtos"
            description="Cadastre os produtos que terão coleta de feedback por item."
            emptyLabel="Nenhum produto cadastrado ainda."
            items={productItems}
            onChange={setProductItems}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="btn-primary font-poppins px-6 py-3 text-sm"
            >
              Salvar Catálogo de Produtos
            </button>
            {productItems.length > 0 ? (
              <Link
                to="/user/qrcode/products"
                className="btn-ghost font-poppins px-4 py-3 text-sm"
              >
                Configurar perguntas por produto
              </Link>
            ) : (
              <span className="rounded-lg border border-(--quaternary-color)/12 px-4 py-3 text-xs text-(--text-tertiary)">
                Cadastre ao menos um produto para configurar perguntas por item.
              </span>
            )}
          </div>
        </Form>
        )
      )}

      {activeTab === 'SERVICE' && (
        !servicesEnabled ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <h3 className="text-sm font-semibold text-amber-200">
              Serviços desativados nas Informações Gerais
            </h3>
            <p className="mt-1 text-xs text-amber-100/90">
              Habilite o uso de serviços para editar catálogo e perguntas por item.
            </p>
            <Link
              to="/user/edit/collecting-data-enterprise"
              className="mt-3 inline-flex rounded-lg border border-amber-400/50 px-3 py-2 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-500/15"
            >
              Ir para Informações Gerais
            </Link>
          </div>
        ) : (
        <Form
          method="post"
          onSubmit={() => handleCatalogSubmit(serviceItems, servicesInputRef)}
          className="space-y-4"
        >
          <input
            type="hidden"
            name="intent"
            value={INTENT_FEEDBACK_SETTINGS_SAVE_SERVICES_CATALOG}
          />
          <input
            ref={servicesInputRef}
            type="hidden"
            name="catalog_items"
            defaultValue="[]"
          />

          <div className="rounded-xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-4">
            <p className="text-sm text-(--text-secondary)">
              {serviceItems.length > 0
                ? `Você possui ${serviceItems.length} serviço(s) no catálogo.`
                : 'Você ainda não possui serviços cadastrados neste tipo.'}
            </p>
            <p className="mt-1 text-xs text-(--text-tertiary)">
              Após salvar o catálogo, configure as perguntas de cada item na tela de QR Codes por serviço.
            </p>
          </div>

          <FieldCatalogItems
            title="Catálogo de Serviços"
            description="Cadastre os serviços que terão coleta de feedback por item."
            emptyLabel="Nenhum serviço cadastrado ainda."
            items={serviceItems}
            onChange={setServiceItems}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="btn-primary font-poppins px-6 py-3 text-sm"
            >
              Salvar Catálogo de Serviços
            </button>
            {serviceItems.length > 0 ? (
              <Link
                to="/user/qrcode/services"
                className="btn-ghost font-poppins px-4 py-3 text-sm"
              >
                Configurar perguntas por serviço
              </Link>
            ) : (
              <span className="rounded-lg border border-(--quaternary-color)/12 px-4 py-3 text-xs text-(--text-tertiary)">
                Cadastre ao menos um serviço para configurar perguntas por item.
              </span>
            )}
          </div>
        </Form>
        )
      )}

      {activeTab === 'DEPARTMENT' && (
        !departmentsEnabled ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <h3 className="text-sm font-semibold text-amber-200">
              Departamentos desativados nas Informações Gerais
            </h3>
            <p className="mt-1 text-xs text-amber-100/90">
              Habilite o uso de departamentos para editar catálogo e perguntas por item.
            </p>
            <Link
              to="/user/edit/collecting-data-enterprise"
              className="mt-3 inline-flex rounded-lg border border-amber-400/50 px-3 py-2 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-500/15"
            >
              Ir para Informações Gerais
            </Link>
          </div>
        ) : (
        <Form
          method="post"
          onSubmit={() => handleCatalogSubmit(departmentItems, departmentsInputRef)}
          className="space-y-4"
        >
          <input
            type="hidden"
            name="intent"
            value={INTENT_FEEDBACK_SETTINGS_SAVE_DEPARTMENTS_CATALOG}
          />
          <input
            ref={departmentsInputRef}
            type="hidden"
            name="catalog_items"
            defaultValue="[]"
          />

          <div className="rounded-xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-4">
            <p className="text-sm text-(--text-secondary)">
              {departmentItems.length > 0
                ? `Você possui ${departmentItems.length} departamento(s) no catálogo.`
                : 'Você ainda não possui departamentos cadastrados neste tipo.'}
            </p>
            <p className="mt-1 text-xs text-(--text-tertiary)">
              Após salvar o catálogo, configure as perguntas de cada item na tela de QR Codes por departamento.
            </p>
          </div>

          <FieldCatalogItems
            title="Catálogo de Departamentos"
            description="Cadastre os departamentos que terão coleta de feedback por item."
            emptyLabel="Nenhum departamento cadastrado ainda."
            items={departmentItems}
            onChange={setDepartmentItems}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="btn-primary font-poppins px-6 py-3 text-sm"
            >
              Salvar Catálogo de Departamentos
            </button>
            {departmentItems.length > 0 ? (
              <Link
                to="/user/qrcode/departments"
                className="btn-ghost font-poppins px-4 py-3 text-sm"
              >
                Configurar perguntas por departamento
              </Link>
            ) : (
              <span className="rounded-lg border border-(--quaternary-color)/12 px-4 py-3 text-xs text-(--text-tertiary)">
                Cadastre ao menos um departamento para configurar perguntas por item.
              </span>
            )}
          </div>
        </Form>
        )
      )}
    </div>
  );
}
