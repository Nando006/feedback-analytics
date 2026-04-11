/**
 * Formato padrão de retorno das actions do Data Router.
 * Usado em: components/public/forms/formRegister.tsx.
 */
export type ActionData = {
  ok?: boolean;
  error?: string;
  message?: string;
  issues?: unknown;
};