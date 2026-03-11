import CardSimple from 'components/user/shared/cards/cardSimple';
import Header from 'components/user/pages/profile/editCollectingData/header';
import FormCollectingDataEnterprise from 'components/user/pages/profile/editCollectingData/formCollectingDataEnterprise';

export default function EditCollectingData() {

  return (
    <div className="font-inter space-y-6 pb-8">
      <Header />
      
      <CardSimple disableGlass>
        <div className="w-full">
          <div className="mb-6 border-b border-(--quaternary-color)/10 pb-4">
            <h2 className="text-xl font-semibold text-(--text-primary)">
              Configuração de Coleta de Dados
            </h2>
            <p className="mt-2 text-sm text-(--text-tertiary)">
              Configure como sua empresa irá coletar e utilizar os feedbacks dos clientes.
            </p>
          </div>

          <FormCollectingDataEnterprise />
        </div>
      </CardSimple>
    </div>
  );
}
