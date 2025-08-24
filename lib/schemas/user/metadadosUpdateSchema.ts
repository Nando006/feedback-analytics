import z from 'zod';

export const metadadosUpdateSchema = z
  .object({
    full_name: z.string().min(2).max(120).optional(),
  })
  .refine((data) => typeof data.full_name !== 'undefined', {
    message: 'at_least_one_field',
  });
