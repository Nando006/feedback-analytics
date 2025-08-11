import { redirect, type LoaderFunctionArgs } from 'react-router-dom';

export async function LoaderUserProtected(_args: LoaderFunctionArgs) {
  const res = await fetch('/api/me', { credentials: 'same-origin' });
  if (res.status === 401) {
    return redirect('/login');
  }

  return null;
}
