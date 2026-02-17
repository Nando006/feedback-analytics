import type { PropsFieldCompanyObjective } from "lib/interfaces/user/propsCollectingDataEnterprise";

export default function FieldCompanyObjective({ value, onChange }: PropsFieldCompanyObjective) {
  return (
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
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ex: Fornecer soluções tecnológicas inovadoras para pequenas e médias empresas..."
        />
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            Descreva qual é o foco principal da empresa
          </p>
          <span className="text-xs text-neutral-600">
            {value.length} caracteres
          </span>
        </div>
      </div>
    </div>
  );
}
