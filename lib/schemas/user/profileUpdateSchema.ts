import z from 'zod';

export const profileUpdateSchema = z
  .object({
    full_name: z.string().min(2).max(120).optional(),
    company_name: z.string().min(2).max(120).optional(),
    document: z.string().min(11).max(18).optional(),
    phone: z.string().min(8).max(20).optional(),
  })
  .refine(
    (data) =>
      typeof data.full_name !== 'undefined' ||
      typeof data.company_name !== 'undefined' ||
      typeof data.document !== 'undefined' ||
      typeof data.phone !== 'undefined',
    { message: 'at_least_one_field' },
  );
