import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../index.js';
import { createSupabaseServerClient } from '../config/supabase.js';
import { makeMockSupabase, TEST_USER } from './helpers/supabase-mock.js';

vi.mock('../config/supabase.js', () => ({
  createSupabaseServerClient: vi.fn(),
}));

const mockCreateClient = vi.mocked(createSupabaseServerClient);

describe('[Integração] POST /api/public/auth/login', () => {
  let mockSupabase: ReturnType<typeof makeMockSupabase>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = makeMockSupabase();
    mockCreateClient.mockReturnValue(mockSupabase as never);
  });

  it('[CT-UC02-01] retorna 200 com credenciais válidas', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: TEST_USER, session: { access_token: 'tok' } },
      error: null,
    });

    const res = await request(app)
      .post('/api/public/auth/login')
      .send({ email: 'gestor@empresateste.com', password: 'Senha@123' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.user).toMatchObject({ id: TEST_USER.id });
  });

  it('[CT-UC02-02] retorna 400 com payload inválido (sem email)', async () => {
    const res = await request(app)
      .post('/api/public/auth/login')
      .send({ password: 'Senha@123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_payload');
  });

  it('[CT-UC02-03] retorna 400 com payload inválido (senha curta)', async () => {
    const res = await request(app)
      .post('/api/public/auth/login')
      .send({ email: 'gestor@empresateste.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_payload');
  });

  it('[CT-UC02-04] retorna 401 com credenciais incorretas', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { code: 'invalid_credentials', message: 'Invalid login credentials' },
    });

    const res = await request(app)
      .post('/api/public/auth/login')
      .send({ email: 'gestor@empresateste.com', password: 'senha_errada' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid_credentials');
  });

  it('[RNE-014] e-mail não confirmado retorna a mesma resposta de credenciais inválidas (anti-enumeração)', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { code: 'email_not_confirmed', message: 'Email not confirmed' },
    });

    const res = await request(app)
      .post('/api/public/auth/login')
      .send({ email: 'novo@teste.com', password: 'Senha@123' });

    // A resposta deve ser indistinguível da de credenciais inválidas: não pode
    // revelar que a conta existe (porém não confirmada).
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid_credentials');

    const serialized = JSON.stringify(res.body).toLowerCase();
    expect(serialized).not.toContain('confirm');
    expect(serialized).not.toContain('verificad');
  });
});

describe('[Integração] POST /api/public/auth/logout', () => {
  let mockSupabase: ReturnType<typeof makeMockSupabase>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = makeMockSupabase();
    mockCreateClient.mockReturnValue(mockSupabase as never);
  });

  it('retorna 204 ao deslogar', async () => {
    const res = await request(app).post('/api/public/auth/logout');
    expect(res.status).toBe(204);
  });
});

describe('[Integração] POST /api/public/auth/register', () => {
  const VALID_PAYLOAD = {
    accountType: 'CPF',
    fullName: 'João da Silva',
    document: '52998224725',
    email: `novo+${Date.now()}@teste.com`,
    password: 'Senha@123!',
    confirmPassword: 'Senha@123!',
    phone: '+5511999990001',
    terms: true,
  };

  let mockSupabase: ReturnType<typeof makeMockSupabase>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = makeMockSupabase();
    mockCreateClient.mockReturnValue(mockSupabase as never);
    // Por padrão: telefone e documento não existem, signUp bem-sucedido
    mockSupabase.rpc.mockResolvedValue({ data: false, error: null });
    mockSupabase.auth.signUp.mockResolvedValue({ data: { user: null }, error: null });
  });

  it('[CT-UC01-01] retorna 200 com confirmation_required para dados válidos', async () => {
    const res = await request(app)
      .post('/api/public/auth/register')
      .send(VALID_PAYLOAD);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, message: 'confirmation_required' });
  });

  it('[CT-UC01-02] retorna 400 com payload inválido (sem email)', async () => {
    const res = await request(app)
      .post('/api/public/auth/register')
      .send({ ...VALID_PAYLOAD, email: undefined });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_payload');
  });

  it('[CT-UC01-03] retorna 400 com CPF inválido', async () => {
    const res = await request(app)
      .post('/api/public/auth/register')
      .send({ ...VALID_PAYLOAD, document: '11111111111' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_payload');
  });

  it('[CT-UC01-04] retorna 400 quando senhas não coincidem', async () => {
    const res = await request(app)
      .post('/api/public/auth/register')
      .send({ ...VALID_PAYLOAD, confirmPassword: 'outra_senha' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_payload');
  });

  it('[CT-UC01-05] retorna 200 com confirmation_required quando e-mail já cadastrado', async () => {
    mockSupabase.auth.signUp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'User already registered' },
    });

    const res = await request(app)
      .post('/api/public/auth/register')
      .send(VALID_PAYLOAD);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, message: 'confirmation_required' });
  });

  it('[CT-UC01-06] retorna 409 quando telefone já cadastrado', async () => {
    mockSupabase.rpc.mockResolvedValueOnce({ data: true, error: null });

    const res = await request(app)
      .post('/api/public/auth/register')
      .send(VALID_PAYLOAD);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('phone_taken');
  });
});

describe('[Integração] POST /api/public/auth/forgot-password', () => {
  let mockSupabase: ReturnType<typeof makeMockSupabase>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = makeMockSupabase();
    mockCreateClient.mockReturnValue(mockSupabase as never);
  });

  it('[CT-UC03-01] retorna 200 com e-mail válido cadastrado', async () => {
    (mockSupabase.auth as { resetPasswordForEmail: ReturnType<typeof vi.fn> })
      .resetPasswordForEmail = vi.fn().mockResolvedValueOnce({ error: null });
    mockCreateClient.mockReturnValue(mockSupabase as never);

    const res = await request(app)
      .post('/api/public/auth/forgot-password')
      .send({ email: 'gestor@empresateste.com' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('[CT-UC03-02] retorna 400 com payload inválido (sem email)', async () => {
    const res = await request(app)
      .post('/api/public/auth/forgot-password')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_payload');
  });

  it('[CT-UC03-03] retorna 400 com e-mail inválido', async () => {
    const res = await request(app)
      .post('/api/public/auth/forgot-password')
      .send({ email: 'nao-e-um-email' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_payload');
  });
});
