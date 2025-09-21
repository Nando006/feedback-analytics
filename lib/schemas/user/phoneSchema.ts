import z from 'zod';

export const phoneStartSchema = z.object({
  phone: z.string().regex(/^\+55\d{10,11}$/, {
    message: 'Telefone no formato +55DDXXXXXXXXX',
  }),
});
export type PhoneStartFormValues = z.infer<typeof phoneStartSchema>;

export const phoneVerifySchema = z.object({
  token: z.string().min(1, { message: 'Informe o código recebido' }),
});
export type PhoneVerifyFormValues = z.infer<typeof phoneVerifySchema>;
