import PageHeader from "components/user/shared/PageHeader";
import CatalogItemsList from "components/user/pages/catalog/catalogItemsList";

export default function EditFeedbackProducts() {
  return (
    <div className="font-work-sans space-y-6 pb-8">
      <PageHeader />
      <CatalogItemsList kindSlug="products" />
    </div>
  );
}
