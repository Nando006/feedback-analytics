import z from 'zod';

export const enterpriseUpdateSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    document: z.string().min(11).max(18).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(8).max(20).optional(),
  })
  .refine(
    (data) =>
      typeof data.name !== 'undefined' ||
      typeof data.document !== 'undefined' ||
      typeof data.email !== 'undefined' ||
      typeof data.phone !== 'undefined',
    { message: 'at_least_one_field' },
  );
