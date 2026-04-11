import z from 'zod';

// Esquema para atualizar o email do usuário.
export const emailUpdateSchema = z
  .object({
    email: z.string().email({ message: 'Email inválido' }),
  });
