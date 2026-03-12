import { memo, useState } from 'react';
import type { FieldAnalyticsGoalProps } from './ui.types';

const FieldAnalyticsGoal = memo(function FieldAnalyticsGoal({ defaultValue }: FieldAnalyticsGoalProps) {
  const [characterCount, setCharacterCount] = useState(defaultValue.length);

  return (
    <div className="group font-work-sans">
      <label
        htmlFor="analytics_goal"
        className="mb-2 block text-sm font-medium text-(--text-secondary) transition-colors group-focus-within:text-(--tertiary-color)">
        Objetivo Analítico
        <span className="ml-1 text-xs text-(--text-tertiary)">(obrigatório)</span>
      </label>
      <div className="relative">
        <textarea
          id="analytics_goal"
          name="analytics_goal"
          className="w-full rounded-xl border border-(--quaternary-color)/14 bg-(--seventh-color) px-4 py-3 text-(--text-primary) outline-none transition-all duration-200 placeholder:text-(--text-tertiary) focus:border-(--tertiary-color) focus:ring-2 focus:ring-(--tertiary-color)/20"
          rows={4}
          defaultValue={defaultValue}
          onInput={(event) => setCharacterCount(event.currentTarget.value.length)}
          placeholder="Ex: Identificar padrões de satisfação do cliente e áreas de melhoria no atendimento..."
        />
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-xs text-(--text-tertiary)">
            Explique como deseja utilizar os feedbacks coletados
          </p>
          <span className="text-xs text-(--text-tertiary)">
            {characterCount} caracteres
          </span>
        </div>
      </div>
    </div>
  );
});

export default FieldAnalyticsGoal;
