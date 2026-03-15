import z from 'zod';

// Schema base genérico para todos os canais de feedback
export const feedbackBaseSchema = z.object({
  enterprise_id: z.uuidv4(),
  rating: z.number().int().min(1).max(5),
  message: z.string().min(3).max(5000),
  answers: z
    .array(
      z.object({
        question_id: z.uuidv4(),
        answer_value: z.enum(['PESSIMO', 'RUIM', 'MEDIANA', 'BOA', 'OTIMA']),
      }),
    )
    .length(3),

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

// Schema específico para QR Code
export const qrcodeFeedbackSchema = feedbackBaseSchema.extend({
  channel: z.literal('QRCODE'),
  collection_point_id: z.uuidv4().optional(),
  catalog_item_id: z.uuidv4().optional(),
});

// Types exportados
export type FeedbackBasePayload = z.infer<typeof feedbackBaseSchema>;
export type QrcodeFeedbackPayload = z.infer<typeof qrcodeFeedbackSchema>;
