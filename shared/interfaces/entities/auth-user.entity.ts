/**
 * Metadados adicionais do usuário autenticado vindos do provedor de auth.
 * Usado em: lib/interfaces/entities/auth-user.entity.ts (composição de AuthUser).
 */
export interface AuthUserMetadata {
  full_name?: string | null;
  [key: string]: unknown;
}

/**
 * Estrutura do usuário autenticado utilizada na aplicação.
 * Usado em: src/services/serviceUser.ts, src/routes/load/loadUserContext.ts, pages/user/profile.tsx e pages/user/qrcodes/qrcodeEnterprise.tsx.
 */
export interface AuthUser {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    user_metadata?: AuthUserMetadata;
  };
}
