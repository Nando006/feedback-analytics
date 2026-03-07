import { memo, useState } from 'react';
import type { FieldCompanyObjectiveProps } from './ui.types';

const FieldCompanyObjective = memo(function FieldCompanyObjective({
  defaultValue,
}: FieldCompanyObjectiveProps) {
  const [characterCount, setCharacterCount] = useState(defaultValue.length);

  return (
    <div className="group">
      <label
        htmlFor="company_objective"
        className="mb-2 block text-sm font-medium text-(--text-secondary) transition-colors group-focus-within:text-(--primary-color)">
        Objetivo da Empresa
        <span className="ml-1 text-xs text-(--text-tertiary)">(obrigatório)</span>
      </label>
      <div className="relative">
        <textarea
          id="company_objective"
          name="company_objective"
          className="w-full rounded-xl border border-(--quaternary-color)/14 bg-(--seventh-color) px-4 py-3 text-(--text-primary) outline-none transition-all duration-200 placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20"
          rows={4}
          defaultValue={defaultValue}
          onInput={(event) => setCharacterCount(event.currentTarget.value.length)}
          placeholder="Ex: Fornecer soluções tecnológicas inovadoras para pequenas e médias empresas..."
        />
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-xs text-(--text-tertiary)">
            Descreva qual é o foco principal da empresa
          </p>
          <span className="text-xs text-(--text-tertiary)">{characterCount} caracteres</span>
        </div>
      </div>
    </div>
  );
});

export default FieldCompanyObjective;
