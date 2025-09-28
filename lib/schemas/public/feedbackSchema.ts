import z from 'zod';

export const feedbackPublicSchema = z.object({
  enterprise_id: z.uuidv4(),
  rating: z.number().int().min(1).max(5),
  message: z.string().min(3).max(5000),
  channel: z.literal('QRCODE'),

  // opcionais
  customer_name: z.string().min(1).max(120).optional(),
  customer_email: z.email().optional(),
  customer_phone: z.string().max(32).optional(),
  customer_birth_date: z.string().optional(),
  customer_gender: z
    .enum(['masculino', 'feminino', 'outro', 'prefiro_nao_informar'])
    .optional(),
  customer_city: z.string().max(120).optional(),
  customer_state: z.string().max(80).optional(),
  customer_country: z.string().max(80).optional(),
});

export type FeedbackPublicPayload = z.infer<typeof feedbackPublicSchema>;
