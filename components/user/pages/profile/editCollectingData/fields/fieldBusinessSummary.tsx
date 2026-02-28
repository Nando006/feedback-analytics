import { memo, useState } from 'react';
import type { FieldBusinessSummaryProps } from './ui.types';


const FieldBusinessSummary = memo(function FieldBusinessSummary({ defaultValue }: FieldBusinessSummaryProps) {
  const [characterCount, setCharacterCount] = useState(defaultValue.length);

  return (
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
          defaultValue={defaultValue}
          onInput={(event) => setCharacterCount(event.currentTarget.value.length)}
          placeholder="Ex: Atuamos há 5 anos no mercado de software, oferecendo sistemas de gestão..."
        />
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            Conte brevemente sobre a empresa e seu funcionamento
          </p>
          <span className="text-xs text-neutral-600">
            {characterCount} caracteres
          </span>
        </div>
      </div>
    </div>
  );
});

export default FieldBusinessSummary;
