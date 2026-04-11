import { useLoaderData } from 'react-router-dom';
import type { LoaderQrCodeProducts } from 'src/routes/loaders/loaderQrCodeProducts';
import QrCodeCatalogPage from 'components/user/pages/qrcodeCatalog/QrCodeCatalogPage';

export default function QRCodeProducts() {
  const data =
    useLoaderData<Awaited<ReturnType<typeof LoaderQrCodeProducts>>>();

  return (
    <QrCodeCatalogPage
      title="QR Codes por Produto"
      subtitle="Ative um QR Code para cada produto e acompanhe feedbacks segmentados."
      data={data}
    />
  );
}
