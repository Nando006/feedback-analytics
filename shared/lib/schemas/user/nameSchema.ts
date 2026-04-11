import z from 'zod';

export const nameSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: 'Informe ao menos 2 caracteres' })
    .max(120, { message: 'Nome muito longo' }),
});
export type NameFormValues = z.infer<typeof nameSchema>;
