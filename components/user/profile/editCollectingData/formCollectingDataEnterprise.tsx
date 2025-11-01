import type { PropsCollectingDataEnterprise } from "lib/interfaces/entities/enterprise";
import { useEffect, useState, type ChangeEvent } from "react";
import { Form, useRouteLoaderData } from "react-router-dom";

export default function FormCollectingDataEnterprise() {

    const { collecting } = useRouteLoaderData('user') as {
      collecting: PropsCollectingDataEnterprise | null;
    };

    const [companyObjective, setCompanyObjective] = useState(
      collecting?.company_objective ?? '',
    );
    const [analyticsGoal, setAnalyticsGoal] = useState(
      collecting?.analytics_goal ?? '',
    );
    const [businessSummary, setBusinessSummary] = useState(
      collecting?.business_summary ?? '',
    );
    const [usesCompanyProducts, setUsesCompanyProducts] = useState(
      collecting?.uses_company_products ?? false,
    );
    const [productsText, setProductsText] = useState(
      (collecting?.main_products_or_services ?? []).join('\n'),
    );

    useEffect(() => {
      if (!usesCompanyProducts) {
        setProductsText('');
      }
    }, [usesCompanyProducts]);

    const handleToggle = (event: ChangeEvent<HTMLInputElement>) => {
      setUsesCompanyProducts(event.target.checked);
    };
  return (
    <Form
      method="post"
      className="space-y-8">
      <div className="space-y-6">
        {/* Objetivo da Empresa */}
        <div className="group">
          <label
            htmlFor="company_objective"
            className="mb-2 block text-sm font-medium text-neutral-300 transition-colors group-focus-within:text-purple-400">
            Objetivo da Empresa
            <span className="ml-1 text-xs text-neutral-500">(obrigatório)</span>
          </label>
          <div className="relative">
            <textarea
              id="company_objective"
              name="company_objective"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-neutral-100 outline-none transition-all duration-200 placeholder:text-neutral-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              rows={4}
              value={companyObjective}
              onChange={(event) => setCompanyObjective(event.target.value)}
              placeholder="Ex: Fornecer soluções tecnológicas inovadoras para pequenas e médias empresas..."
            />
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-xs text-neutral-500">
                Descreva qual é o foco principal da empresa
              </p>
              <span className="text-xs text-neutral-600">
                {companyObjective.length} caracteres
              </span>
            </div>
          </div>
        </div>

        {/* Objetivo Analítico */}
        <div className="group">
          <label
            htmlFor="analytics_goal"
            className="mb-2 block text-sm font-medium text-neutral-300 transition-colors group-focus-within:text-blue-400">
            Objetivo Analítico
            <span className="ml-1 text-xs text-neutral-500">(obrigatório)</span>
          </label>
          <div className="relative">
            <textarea
              id="analytics_goal"
              name="analytics_goal"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-neutral-100 outline-none transition-all duration-200 placeholder:text-neutral-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              rows={4}
              value={analyticsGoal}
              onChange={(event) => setAnalyticsGoal(event.target.value)}
              placeholder="Ex: Identificar padrões de satisfação do cliente e áreas de melhoria no atendimento..."
            />
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-xs text-neutral-500">
                Explique como deseja utilizar os feedbacks coletados
              </p>
              <span className="text-xs text-neutral-600">
                {analyticsGoal.length} caracteres
              </span>
            </div>
          </div>
        </div>

        {/* Resumo do Negócio */}
        <div className="group">
          <label
            htmlFor="business_summary"
            className="mb-2 block text-sm font-medium text-neutral-300 transition-colors group-focus-within:text-emerald-400">
            Resumo do Negócio
            <span className="ml-1 text-xs text-neutral-500">(opcional)</span>
          </label>
          <div className="relative">
            <textarea
              id="business_summary"
              name="business_summary"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-neutral-100 outline-none transition-all duration-200 placeholder:text-neutral-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              rows={5}
              value={businessSummary}
              onChange={(event) => setBusinessSummary(event.target.value)}
              placeholder="Ex: Atuamos há 5 anos no mercado de software, oferecendo sistemas de gestão..."
            />
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-xs text-neutral-500">
                Conte brevemente sobre a empresa e seu funcionamento
              </p>
              <span className="text-xs text-neutral-600">
                {businessSummary.length} caracteres
              </span>
            </div>
          </div>
        </div>

        {/* Toggle de Produtos/Serviços */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 transition-all duration-200 hover:border-neutral-700">
          <label className="flex cursor-pointer items-start gap-4">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                name="uses_company_products"
                checked={usesCompanyProducts}
                onChange={handleToggle}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-neutral-600 bg-neutral-800 transition-all checked:border-purple-500 checked:bg-purple-500 focus:ring-2 focus:ring-purple-500/30"
              />
              <svg
                className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="flex-1">
              <span className="block text-sm font-medium text-neutral-200">
                Utiliza produtos/serviços próprios na operação?
              </span>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                Marque esta opção para habilitar o cadastro de produtos ou
                serviços específicos e coletar feedback direcionado sobre eles.
              </p>
            </div>
          </label>
        </div>

        {/* Campo de Produtos (condicional) */}
        {usesCompanyProducts && (
          <div className="animate-fadeIn group overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent p-6">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <svg
                  className="h-5 w-5 text-purple-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle
                    cx="9"
                    cy="7"
                    r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="flex-1">
                <label
                  htmlFor="main_products_or_services"
                  className="block text-sm font-medium text-neutral-200">
                  Produtos ou Serviços Principais
                </label>
                <p className="mt-1 text-xs text-neutral-400">
                  Liste um produto ou serviço por linha
                </p>
              </div>
            </div>

            <textarea
              id="main_products_or_services"
              name="main_products_or_services"
              className="w-full rounded-lg border border-purple-500/30 bg-neutral-900 px-4 py-3 font-mono text-sm text-neutral-100 outline-none transition-all duration-200 placeholder:text-neutral-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
              rows={5}
              value={productsText}
              onChange={(event) => setProductsText(event.target.value)}
              placeholder="Sistema de Gestão Empresarial&#10;Consultoria em TI&#10;Suporte Técnico Premium&#10;Desenvolvimento de Software"
            />

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-2">
              <svg
                className="h-4 w-4 flex-shrink-0 text-purple-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <circle
                  cx="12"
                  cy="12"
                  r="10"></circle>
                <line
                  x1="12"
                  y1="16"
                  x2="12"
                  y2="12"></line>
                <line
                  x1="12"
                  y1="8"
                  x2="12.01"
                  y2="8"></line>
              </svg>
              <p className="text-xs text-purple-300">
                Esses itens serão utilizados para direcionar e categorizar os
                feedbacks recebidos
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Botão de Submit */}
      <div className="flex items-center justify-end gap-4 border-t border-neutral-800 pt-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-xl border border-neutral-700 bg-transparent px-6 py-3 text-sm font-semibold text-neutral-300 transition-all duration-200 hover:border-neutral-600 hover:bg-neutral-800/50">
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary group flex items-center gap-2 px-8 py-3">
          <span>Salvar Alterações</span>
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </Form>
  );
}