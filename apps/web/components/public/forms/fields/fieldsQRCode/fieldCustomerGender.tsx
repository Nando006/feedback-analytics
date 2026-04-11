import type { CustomerData } from 'lib/interfaces/contracts/qrcode/feedback.contract';
import type { FieldCustomerGenderProps } from './ui.types';

export default function FieldCustomerGender({ gender, onGenderChange }: FieldCustomerGenderProps) {
  return (
    <div>
      <label
        htmlFor="customer_gender"
        className="font-work-sans block text-sm font-medium text-(--text-primary) mb-2">
        Gênero
      </label>
      <select
        id="customer_gender"
        value={gender || ''}
        onChange={(e) => onGenderChange(e.target.value as CustomerData['customer_gender'])}
        className="font-poppins w-full rounded-lg border border-(--bg-tertiary) bg-(--bg-secondary) px-4 py-3 text-(--text-primary) transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-(--primary-color)">
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
