import type { LoaderFunctionArgs } from 'react-router-dom';
import { loadQrCodeCatalogData } from 'src/routes/load/loadQrCodeCatalog';

export async function LoaderQrCodeProducts(_args: LoaderFunctionArgs) {
  void _args;
  return await loadQrCodeCatalogData('PRODUCT');
}
