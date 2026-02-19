import type { CustomerData } from 'lib/interfaces/contracts/qrcode.contract';
import type { FieldCustomerGenderProps } from './ui.types';

export default function FieldCustomerGender({ gender, onGenderChange }: FieldCustomerGenderProps) {
  return (
    <div>
      <label
        htmlFor="customer_gender"
        className="block text-sm font-medium text-neutral-200 mb-2">
        Gênero
      </label>
      <select
        id="customer_gender"
        value={gender || ''}
        onChange={(e) => onGenderChange(e.target.value as CustomerData['customer_gender'])}
        className="w-full px-4 py-3 border border-neutral-700 rounded-lg bg-neutral-800 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all">
        <option value="">Selecione...</option>
        <option value="masculino">Masculino</option>
        <option value="feminino">Feminino</option>
        <option value="outro">Outro</option>
        <option value="prefiro_nao_informar">
          Prefiro não informar
        </option>
      </select>
    </div>
  );
}
