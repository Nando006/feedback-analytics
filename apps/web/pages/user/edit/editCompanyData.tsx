import CardSimple from 'components/user/shared/cards/cardSimple';
import PageHeader from 'components/user/shared/PageHeader';
import FormCollectingDataEnterprise from 'components/user/pages/profile/editCollectingData/formCollectingDataEnterprise';

export default function EditCompanyData() {
  return (
    <div className="font-work-sans space-y-6 pb-8">
      <PageHeader />

      <CardSimple>
        <div className="w-full">
          <FormCollectingDataEnterprise />
        </div>
      </CardSimple>
    </div>
  );
}
