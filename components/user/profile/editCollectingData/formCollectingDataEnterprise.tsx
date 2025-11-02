import type { PropsCollectingDataEnterprise } from "lib/interfaces/entities/enterprise";
import { useEffect, useState, type ChangeEvent } from "react";
import { Form, useRouteLoaderData } from "react-router-dom";
import FieldCompanyObjective from "./fields/fieldCompanyObjective";
import FieldAnalyticsGoal from "./fields/fieldAnalyticsGoal";
import FieldBusinessSummary from "./fields/fieldBusinessSummary";
import FieldUsesCompanyProducts from "./fields/fieldUsesCompanyProducts";
import FieldMainProducts from "./fields/fieldMainProducts";

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
        <FieldCompanyObjective
          value={companyObjective}
          onChange={setCompanyObjective}
        />

        <FieldAnalyticsGoal
          value={analyticsGoal}
          onChange={setAnalyticsGoal}
        />

        <FieldBusinessSummary
          value={businessSummary}
          onChange={setBusinessSummary}
        />

        <FieldUsesCompanyProducts
          checked={usesCompanyProducts}
          onChange={handleToggle}
        />

        {usesCompanyProducts && (
          <FieldMainProducts
            value={productsText}
            onChange={setProductsText}
          />
        )}
      </div>

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