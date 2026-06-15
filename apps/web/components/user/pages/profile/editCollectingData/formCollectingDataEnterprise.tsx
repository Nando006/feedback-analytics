import type { CollectingDataEnterprise } from "lib/interfaces/entities/enterprise.entity";
import type { ActionData } from "lib/interfaces/contracts/action-data.contract";
import { useEffect, useState } from "react";
import { useFetcher, useRouteLoaderData } from "react-router-dom";
import { useToast } from "components/public/forms/messages/useToast";
import { FaCheck, FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const STEPS = [
  {
    key: "business_summary",
    tab: "Resumo do negócio",
    title: "Resumo do Negócio",
    hint: "O que sua empresa faz e para quem. É o contexto base que a IA usa em tudo.",
    placeholder:
      "Descreva seu negócio. (O que faz? Para quem?) Ex: Rede de clínicas odontológicas focada em tratamentos estéticos de alta tecnologia.",
  },
  {
    key: "company_objective",
    tab: "Objetivo da empresa",
    title: "Objetivo da Empresa",
    hint: "Seu foco atual. A IA usa isso para priorizar o que importa nos feedbacks.",
    placeholder:
      "Instrua a IA sobre seu foco atual para ela filtrar os feedbacks. Ex: Oferecer o melhor custo-benefício e a entrega mais segura em hardware de alto desempenho.",
  },
  {
    key: "analytics_goal",
    tab: "Objetivo analítico",
    title: "Objetivo Analítico",
    hint: "O que você quer descobrir nos feedbacks. Direciona a investigação da IA.",
    placeholder:
      "Instrua a IA sobre o que investigar nos feedbacks. Ex: Identificar os principais motivos de insatisfação com o atendimento.",
  },
] as const;

export default function FormCollectingDataEnterprise() {
  const { collecting } = useRouteLoaderData("user") as {
    collecting: CollectingDataEnterprise | null;
  };

  const fetcher = useFetcher();
  const toast = useToast();
  const isSaving = fetcher.state === "submitting";

  const [values, setValues] = useState<
    Record<(typeof STEPS)[number]["key"], string>
  >(() => ({
    business_summary: collecting?.business_summary ?? "",
    company_objective: collecting?.company_objective ?? "",
    analytics_goal: collecting?.analytics_goal ?? "",
  }));
  const [step, setStep] = useState(0);

  useEffect(() => {
    const data = fetcher.data as ActionData | undefined;
    if (!data) return;

    if (data.ok) {
      toast.success(
        "Configurações salvas!",
        "Dados de coleta atualizados com sucesso",
      );
    } else {
      toast.error(
        "Erro ao salvar configurações",
        data.message || "Tente novamente em instantes",
      );
    }
  }, [fetcher.data, toast]);

  const handleSubmit = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const setValue = (key: keyof typeof values, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const isLast = step === STEPS.length - 1;

  return (
    <div className="relative w-full">
      {/* Seletor horizontal dos passos */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        {STEPS.map((stepItem, index) => {
          const filled = values[stepItem.key].trim().length > 0;
          const active = index === step;

          return (
            <button
              key={stepItem.key}
              type="button"
              onClick={() => setStep(index)}
              aria-current={active ? "step" : undefined}
              className={`flex flex-1 items-center gap-2.5 rounded-xl border px-4 py-3 text-left transition-colors ${
                active
                  ? "border-(--primary-color)/40 bg-(--primary-color)/10"
                  : "border-(--quaternary-color)/12 bg-(--bg-secondary) hover:border-(--primary-color)/25"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  active
                    ? "bg-(--primary-color) text-(--bg-primary)"
                    : filled
                      ? "bg-(--primary-color)/15 text-(--primary-color)"
                      : "bg-(--seventh-color) text-(--text-tertiary)"
                }`}
              >
                {filled && !active ? (
                  <FaCheck aria-hidden className="text-[0.7rem]" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`text-[13px] font-semibold ${
                  active ? "text-(--text-primary)" : "text-(--text-secondary)"
                }`}
              >
                {stepItem.tab}
              </span>
            </button>
          );
        })}
      </div>

      <fetcher.Form
        method="post"
        action="/user/edit/collecting-data-enterprise"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Todos os campos ficam montados (escondidos) para o submit enviar os três. */}
        {STEPS.map((stepItem, index) => (
          <div key={stepItem.key} className={index === step ? "block" : "hidden"}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <h3 className="font-montserrat text-lg font-semibold text-(--text-primary)">
                {stepItem.title}
              </h3>
              <span className="shrink-0 text-xs text-(--text-tertiary)">
                Passo {index + 1} de {STEPS.length}
              </span>
            </div>
            <p className="mb-3 text-sm text-(--text-tertiary)">{stepItem.hint}</p>
            <textarea
              id={stepItem.key}
              name={stepItem.key}
              value={values[stepItem.key]}
              onChange={(event) => setValue(stepItem.key, event.target.value)}
              rows={10}
              className="min-h-[280px] w-full resize-y rounded-xl border border-(--primary-color)/20 bg-(--seventh-color) px-4 py-3 text-[15px] leading-relaxed text-(--text-primary) outline-none transition-all placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20"
              placeholder={stepItem.placeholder}
            />
            <div className="mt-1.5 flex items-center justify-end">
              <span className="text-xs text-(--text-tertiary)">
                {values[stepItem.key].length} caracteres
              </span>
            </div>
          </div>
        ))}

        {/* Navegação */}
        <div className="flex items-center justify-between border-t border-(--quaternary-color)/10 pt-5">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
            className="btn-ghost font-poppins flex items-center gap-2 px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaChevronLeft aria-hidden className="text-[0.7rem]" />
            Anterior
          </button>

          {isLast ? (
            <button
              type="submit"
              className="btn-primary font-poppins px-8 py-2.5 text-sm"
            >
              Salvar Alterações
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setStep((current) => Math.min(STEPS.length - 1, current + 1))
              }
              className="btn-primary font-poppins flex items-center gap-2 px-6 py-2.5 text-sm"
            >
              Próximo
              <FaChevronRight aria-hidden className="text-[0.7rem]" />
            </button>
          )}
        </div>
      </fetcher.Form>

      {isSaving && (
        <div className="pointer-events-none absolute inset-0 rounded-xl border border-(--quaternary-color)/12 bg-(--bg-primary)/35 backdrop-blur-[1px]" />
      )}
    </div>
  );
}
