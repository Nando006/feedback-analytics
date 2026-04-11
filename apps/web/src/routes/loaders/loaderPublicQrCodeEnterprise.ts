import type { LoaderFunctionArgs } from 'react-router-dom';
import { loadPublicQrCodeEnterpriseData } from 'src/routes/load/loadPublicQrCodeEnterprise';

export async function LoaderPublicQrCodeEnterprise({
  request,
}: LoaderFunctionArgs) {
  return await loadPublicQrCodeEnterpriseData(request.url);
}
