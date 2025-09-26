import z from 'zod';

// Esquema para atualizar o email do usuário.
export const emailUpdateSchema = z
  .object({
    email: z.email(),
  })
  .refine((data) => typeof data.email !== 'undefined', {
    message: 'email_required',
  });
