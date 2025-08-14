import z from 'zod';

export const accountTypeSchema = z.enum(['CPF', 'CNPJ']);

const baseSchema = z.object({
  email: z.email({ error: 'E-mail inválido' }),
  phone: z.string().regex(/^\+55\d{10,11}$/, {
    error: 'Telefone inválido. Use o formato +55DDXXXXXXXXX',
  }),
  password: z
    .string()
    .min(8, { error: 'Senha deve ter ao menos 8 caracteres' }),
  confirmPassword: z.string().min(8, { error: 'Confirme sua senha' }),
  terms: z.boolean().refine((v) => v === true, {
    message: 'É necessário aceitar os termos',
  }),
});

const cpfSchema = z.object({
  accountType: z.literal('CPF'),
  fullName: z
    .string()
    .min(2, {
      message: 'Informa nome completo',
    })
    .max(120, {
      message: 'Nome muito longo',
    }),
  document: z.string().regex(/^\d{11}$/, { message: 'CPF inválido' }),
});

const cnpjSchema = z.object({
  accountType: z.literal('CNPJ'),
  companyName: z
    .string()
    .min(2, { message: 'Informe o nome da empresa' })
    .max(160, { message: 'Nome da empresa muito longo' }),
  document: z.string().regex(/^\d{14}$/, { message: 'CNPJ inválido' }),
});

const discriminated = z.discriminatedUnion('accountType', [
  cpfSchema,
  cnpjSchema,
]);

export const registerSchema = discriminated
  .and(baseSchema)
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

export type RegisterSchema = typeof registerSchema;
export type RegisterFormValues = z.input<typeof registerSchema>;
export type AccountType = z.infer<typeof accountTypeSchema>;
