import type { AuthUser } from 'lib/interfaces/entities/auth-user.entity';
import { getJson } from '../../lib/utils/http';

type MetadadosResponse = {
  user: {
    id: string;
    email: string | null;
    user_metadata: Record<string, unknown>;
  } | null;
};
type EmailUpdateResponse = {
  user: { id: string; email: string | null } | null;
};
type OkResponse = { ok: boolean };

export function ServiceGetUser() {
  return getJson<AuthUser>('/api/protected/user/auth_user');
}

export function ServiceUpdateMetadados(full_name: string) {
  return getJson<MetadadosResponse>('/api/protected/user/metadados', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name }),
  });
}

export function ServiceUpdateEmail(email: string) {
  return getJson<EmailUpdateResponse>('/api/protected/user/email', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export function ServiceStartPhoneVerification(phone: string) {
  return getJson<OkResponse>('/api/protected/user/phone/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
}

export function ServiceVerifyPhone(token: string) {
  return getJson<OkResponse>('/api/protected/user/phone/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}