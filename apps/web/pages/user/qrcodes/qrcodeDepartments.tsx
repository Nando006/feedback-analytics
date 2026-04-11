import { useLoaderData } from 'react-router-dom';
import type { LoaderQrCodeDepartments } from 'src/routes/loaders/loaderQrCodeDepartments';
import QrCodeCatalogPage from 'components/user/pages/qrcodeCatalog/QrCodeCatalogPage';

export default function QRCodeDepartments() {
  const data =
    useLoaderData<Awaited<ReturnType<typeof LoaderQrCodeDepartments>>>();

  return (
    <QrCodeCatalogPage
      title="QR Codes por Departamento"
      subtitle="Ative um QR Code para cada departamento e entenda a percepção por área."
      data={data}
    />
  );
}
