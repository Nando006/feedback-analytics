import z from 'zod';

export const loginSchema = z.union([
  z.object({
    email: z.email({ error: 'E-mail inválido' }),
    password: z
      .string()
      .min(6, { error: 'Senha deve ter ao menos 6 caracteres' }),
    remember: z.boolean().default(false),
  }),

  z.object({
    phone: z.string().regex(/^\+55\d{10,11}$/, {
      error: 'Telefone inválido. Use o formato +55DDXXXXXXXXX'
    }),
    password: z.string().min(6, { error: 'Senha deve ter ao menos 6 caracteres' }),
    remember: z.boolean().default(false),
  })
]);


export type LoginSchema = typeof loginSchema;
export type LoginFormValues = z.input<LoginSchema>;
export type LoginOutput = z.output<LoginSchema>; // Não usado
