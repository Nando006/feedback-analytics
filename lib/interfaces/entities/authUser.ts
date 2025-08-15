export interface PropsAuthUser {
  user: {
    id: string;
    email: string | null;
    user_metadata?: Record<string, unknown>;
  };
}
