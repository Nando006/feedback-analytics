import { memo, useState } from 'react';
import type { FieldBusinessSummaryProps } from './ui.types';


const FieldBusinessSummary = memo(function FieldBusinessSummary({ defaultValue }: FieldBusinessSummaryProps) {
  const [characterCount, setCharacterCount] = useState(defaultValue.length);

  return (
    <div className="group">
      <label
        htmlFor="business_summary"
        className="mb-2 block text-sm font-medium text-(--text-secondary) transition-colors group-focus-within:text-(--quinary-color)">
        Resumo do Negócio
        <span className="ml-1 text-xs text-(--text-tertiary)">(opcional)</span>
      </label>
      <div className="relative">
        <textarea
          id="business_summary"
          name="business_summary"
          className="w-full rounded-xl border border-(--quaternary-color)/14 bg-(--seventh-color) px-4 py-3 text-(--text-primary) outline-none transition-all duration-200 placeholder:text-(--text-tertiary) focus:border-(--quinary-color) focus:ring-2 focus:ring-(--quinary-color)/20 font-work-sans"
          rows={5}
          defaultValue={defaultValue}
          onInput={(event) => setCharacterCount(event.currentTarget.value.length)}
          placeholder="Descreva seu negócio. (O que faz? Para quem?) Ex: Rede de clínicas odontológicas focada em tratamentos estéticos de alta tecnologia."
        />
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-xs text-(--text-tertiary)">
            Este campo ajuda a IA a entender o seu nicho de mercado e o perfil do seu público.
          </p>
          <span className="text-xs text-(--text-tertiary)">
            {characterCount} caracteres
          </span>
        </div>
      </div>
    </div>
  );
});

export default FieldBusinessSummary;
