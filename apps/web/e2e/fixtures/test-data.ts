export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL || 'gestor@empresateste.com',
  password: process.env.E2E_TEST_PASSWORD || 'Teste@123',
};

export const TEST_ENTERPRISE_ID = process.env.E2E_TEST_ENTERPRISE_ID || '';

export const VALID_CPF = '529.982.247-25';
export const INVALID_CPF = '111.111.111-11';
export const VALID_CNPJ = '11.222.333/0001-81';

export function uniqueEmail(prefix = 'e2e') {
  return `${prefix}+${Date.now()}@teste.com`;
}

export const QR_FEEDBACK = {
  rating: 5,
  message: 'Ótimo atendimento, equipe muito prestativa e produto excelente.',
};

export const WEAK_PASSWORD = '123';
export const VALID_PASSWORD = 'Teste@123456';
export const MISMATCHED_PASSWORD = 'Outra@Senha123';
