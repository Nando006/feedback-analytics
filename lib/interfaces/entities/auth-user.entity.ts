export interface AuthUserMetadata {
  full_name?: string | null;
  [key: string]: unknown;
}

export interface AuthUser {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    user_metadata?: AuthUserMetadata;
  };
}
