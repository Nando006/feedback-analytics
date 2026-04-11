import { redirect, type LoaderFunctionArgs } from 'react-router-dom';
import { loadUserContextData } from 'src/routes/load/loadUserContext';

export async function LoaderUserProtected(_args: LoaderFunctionArgs) {
  void _args;
  try {
    return await loadUserContextData();
  } catch {
    throw redirect('/login');
  }
}
