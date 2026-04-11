import { useLoaderData } from 'react-router-dom';
import type { LoaderQrCodeServices } from 'src/routes/loaders/loaderQrCodeServices';
import QrCodeCatalogPage from 'components/user/pages/qrcodeCatalog/QrCodeCatalogPage';

export default function QRCodeServices() {
  const data =
    useLoaderData<Awaited<ReturnType<typeof LoaderQrCodeServices>>>();

  return (
    <QrCodeCatalogPage
      title="QR Codes por Serviço"
      subtitle="Ative um QR Code para cada serviço e capture feedback direcionado."
      data={data}
    />
  );
}
