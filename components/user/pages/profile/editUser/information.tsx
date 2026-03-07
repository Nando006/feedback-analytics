
import CardSimple from 'components/user/shared/cards/cardSimple';
import FormPhoneVerifyUser from './forms/formPhoneVerifyUser';
import FormPhoneStartUser from './forms/formPhoneStartUser';
import FormEmailUser from './forms/formEmailUser';
import FormNameUser from './forms/formNameUser';
import type { InformationProps } from './ui.types';

export default function Information({
  defaultFullName,
  defaultEmail,
  defaultPhone,
}: InformationProps) {
  return (
    <CardSimple>
      <div className="w-full">
        <h2 className="mb-4 text-lg font-semibold text-(--text-primary)">Informações básicas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full">
          <FormNameUser defaultFullName={defaultFullName} />

          <FormEmailUser defaultEmail={defaultEmail} />

          <div className="space-y-6 sm:col-span-2">
            <div>
              <p className="text-xs text-(--text-tertiary)">
                Etapas: alterar telefone e depois confirmar com o código SMS.
              </p>
            </div>
            <FormPhoneStartUser defaultPhone={defaultPhone} />
            <FormPhoneVerifyUser />
          </div>
        </div>
      </div>
    </CardSimple>
  );
}
