import z from 'zod';

export const emailUpdateSchema = z
  .object({
    email: z.email(),
  })
  .refine((data) => typeof data.email !== 'undefined', {
    message: 'email_required',
  });
