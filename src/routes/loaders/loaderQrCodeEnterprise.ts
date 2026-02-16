import type { LoaderFunctionArgs } from 'react-router-dom';
import { loadQrCodeEnterpriseData } from 'src/routes/load/loadQrCodeEnterprise';

export async function LoaderQrCodeEnterprise(_args: LoaderFunctionArgs) {
  void _args;
  return await loadQrCodeEnterpriseData();
}
