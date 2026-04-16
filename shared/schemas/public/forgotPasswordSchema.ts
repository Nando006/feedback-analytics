import z from 'zod';

// Schema simples: apenas o e-mail é necessário para solicitar o reset
export const forgotPasswordSchema = z.object({
  email: z.email({ error: 'E-mail inválido' }),
});

export type ForgotPasswordSchema = typeof forgotPasswordSchema;
export type ForgotPasswordFormValues = z.input<ForgotPasswordSchema>;