import type { PropsFieldAnalyticsGoal } from "lib/interfaces/user/propsCollectingDataEnterprise";

export default function FieldAnalyticsGoal({ value, onChange }: PropsFieldAnalyticsGoal) {
  return (
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
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ex: Identificar padrões de satisfação do cliente e áreas de melhoria no atendimento..."
        />
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            Explique como deseja utilizar os feedbacks coletados
          </p>
          <span className="text-xs text-neutral-600">
            {value.length} caracteres
          </span>
        </div>
      </div>
    </div>
  );
}
