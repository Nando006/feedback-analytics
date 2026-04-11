import z from 'zod';

export const accountTypeSchema = z.enum(['CPF', 'CNPJ']);

const REPEATED_DIGITS_REGEX = /^(\d)\1+$/;

function digitsOnly(value: string) {
  return value.replace(/\D+/g, '');
}

function calculateMod11Digit(base: string, startFactor: number) {
  let sum = 0;
  let factor = startFactor;

  for (const char of base) {
    sum += Number(char) * factor;
    factor -= 1;
  }

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function isValidCpf(value: string) {
  const cpf = digitsOnly(value);

  if (cpf.length !== 11 || REPEATED_DIGITS_REGEX.test(cpf)) {
    return false;
  }

  const firstDigit = calculateMod11Digit(cpf.slice(0, 9), 10);
  if (firstDigit !== Number(cpf[9])) {
    return false;
  }

  const secondDigit = calculateMod11Digit(cpf.slice(0, 10), 11);
  return secondDigit === Number(cpf[10]);
}

function calculateCnpjDigit(base: string, factors: number[]) {
  const sum = base
    .split('')
    .reduce((acc, char, index) => acc + Number(char) * factors[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function isValidCnpj(value: string) {
  const cnpj = digitsOnly(value);

  if (cnpj.length !== 14 || REPEATED_DIGITS_REGEX.test(cnpj)) {
    return false;
  }

  const firstDigit = calculateCnpjDigit(cnpj.slice(0, 12), [
    5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
  ]);

  if (firstDigit !== Number(cnpj[12])) {
    return false;
  }

  const secondDigit = calculateCnpjDigit(cnpj.slice(0, 13), [
    6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
  ]);

  return secondDigit === Number(cnpj[13]);
}

function isValidBrazilPhone(value: string) {
  const digits = digitsOnly(value);

  if (!digits.startsWith('55')) {
    return false;
  }

  const local = digits.slice(2);
  if (local.length !== 10 && local.length !== 11) {
    return false;
  }

  const ddd = local.slice(0, 2);
  const dddNumber = Number(ddd);
  if (dddNumber < 11 || dddNumber > 99) {
    return false;
  }

  const subscriber = local.slice(2);
  if (REPEATED_DIGITS_REGEX.test(subscriber)) {
    return false;
  }

  if (subscriber.length === 9) {
    return subscriber.startsWith('9');
  }

  return ['2', '3', '4', '5'].includes(subscriber[0]);
}

const baseSchema = z.object({
  email: z.email({ error: 'E-mail inválido' }),
  phone: z.string().regex(/^\+55\d{10,11}$/, {
    error: 'Telefone inválido. Use o formato +55DDXXXXXXXXX',
  }).refine(isValidBrazilPhone, {
    message: 'Telefone inválido. Verifique DDD e número informado.',
  }),
  password: z
    .string()
    .min(8, { error: 'Senha deve ter ao menos 8 caracteres' }),
  confirmPassword: z.string().min(8, { error: 'Confirme sua senha' }),
  terms: z.boolean().refine((v) => v === true, {
    message: 'É necessário aceitar os termos',
  }),
});

const cpfSchema = z.object({
  accountType: z.literal('CPF'),
  fullName: z
    .string()
    .min(2, {
      message: 'Informa nome completo',
    })
    .max(120, {
      message: 'Nome muito longo',
    }),
  document: z
    .string()
    .regex(/^\d{11}$/, { message: 'CPF inválido' })
    .refine(isValidCpf, { message: 'CPF inválido' }),
});

const cnpjSchema = z.object({
  accountType: z.literal('CNPJ'),
  fullName: z
    .string()
    .min(2, { message: 'Informe o nome da empresa' })
    .max(160, { message: 'Nome da empresa muito longo' }),
  document: z
    .string()
    .regex(/^\d{14}$/, { message: 'CNPJ inválido' })
    .refine(isValidCnpj, { message: 'CNPJ inválido' }),
});

const discriminated = z.discriminatedUnion('accountType', [
  cpfSchema,
  cnpjSchema,
]);

export const registerSchema = discriminated
  .and(baseSchema)
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

export type RegisterSchema = typeof registerSchema;
export type RegisterFormValues = z.input<typeof registerSchema>;
export type AccountType = z.infer<typeof accountTypeSchema>;
