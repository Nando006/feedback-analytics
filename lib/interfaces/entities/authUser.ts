// Metadados do usuário.
export interface PropsAuthUserMetadata {
  full_name?: string | null;
  [key: string]: unknown;
}

// Dados do usuário.
export interface PropsAuthUser {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    user_metadata?: PropsAuthUserMetadata;
  };
}
