import z from 'zod';

const rememberBooleanSchema = z.preprocess((value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false') {
      return false;
    }
  }

  return value;
}, z.boolean({ error: 'Valor inválido para lembrar sessão' }));

export const loginSchema = z.object({
  email: z.email({ error: 'E-mail inválido' }),
  password: z.string().min(6, { error: 'Senha deve ter ao menos 6 caracteres' }),
  remember: rememberBooleanSchema.default(false),
});

export type LoginSchema = typeof loginSchema;
export type LoginFormValues = z.input<LoginSchema>;
export type LoginOutput = z.output<LoginSchema>; // Não usado
