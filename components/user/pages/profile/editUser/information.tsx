import FormEmailUser from 'components/user/profile/editUser/forms/formEmailUser';
import FormNameUser from 'components/user/profile/editUser/forms/formNameUser';
import FormPhoneStartUser from 'components/user/profile/editUser/forms/formPhoneStartUser';
import FormPhoneVerifyUser from 'components/user/profile/editUser/forms/formPhoneVerifyUser';
import CardSimple from 'components/user/shared/cards/cardSimple';

type Props = {
  defaultFullName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
};

export default function Information({
  defaultFullName,
  defaultEmail,
  defaultPhone,
}: Props) {
  return (
    <CardSimple>
      <div className="w-full">
        <h2 className="mb-4 text-lg font-semibold">Informações básicas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full">
          <FormNameUser defaultFullName={defaultFullName} />

          <FormEmailUser defaultEmail={defaultEmail} />

          <div className="space-y-6 sm:col-span-2">
            <div>
              <p className="text-xs text-neutral-400">
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
