import { vi } from 'vitest';

export function createQueryBuilder() {
  const qb = {
    select: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    in: vi.fn(),
    is: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    limit: vi.fn(),
    order: vi.fn(),
    ilike: vi.fn(),
    inner: vi.fn(),
    range: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    // Suporte a `await query` direto (sem .single() ou .maybeSingle())
    then: vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
      const result = { data: [] as unknown[], error: null };
      resolve(result);
      return Promise.resolve(result);
    }),
  };

  const chainables = [
    'select', 'eq', 'neq', 'in', 'is', 'gte', 'lte',
    'limit', 'order', 'ilike', 'inner', 'range',
    'insert', 'update', 'upsert', 'delete',
  ] as const;

  for (const method of chainables) {
    qb[method].mockReturnValue(qb);
  }

  return qb;
}

export type QueryBuilder = ReturnType<typeof createQueryBuilder>;

export function makeMockSupabase() {
  const qb = createQueryBuilder();

  const client = {
    queryBuilder: qb,
    from: vi.fn().mockReturnValue(qb),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    },
  };

  return client;
}

export type MockSupabaseClient = ReturnType<typeof makeMockSupabase>;

export const TEST_USER = {
  id: 'test-user-id-123',
  email: 'gestor@empresateste.com',
};

export const TEST_ENTERPRISE = {
  id: 'test-enterprise-id-456',
  auth_user_id: TEST_USER.id,
  name: 'Empresa Teste',
};
