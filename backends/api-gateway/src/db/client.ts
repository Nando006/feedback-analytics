/**
 * Cliente Drizzle (postgres-js) para os caminhos AUTENTICADOS/INTERNOS do
 * gateway. Lazy: a conexão só é criada no primeiro uso, para o app subir mesmo
 * sem `DATABASE_URL` (o fluxo público anônimo do QR Code continua via Supabase
 * client + RLS, sem Drizzle — ver docs/arquitetura/orm-rls-decisao.md).
 *
 * IMPORTANTE (segurança): esta conexão usa a connection string do Postgres, que
 * roda com uma role que IGNORA a RLS. Portanto, TODA query por aqui DEVE filtrar
 * explicitamente por `enterprise_id` (use os helpers tenant-scoped). A RLS segue
 * ligada como defesa em profundidade.
 */
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
// Schema canônico = saída introspectada do banco real (`npm run db:pull`).
import * as schema from '../../drizzle/schema.js';

let dbInstance: PostgresJsDatabase<typeof schema> | null = null;
let sqlClient: ReturnType<typeof postgres> | null = null;

/**
 * Retorna o cliente Drizzle (singleton). Lança erro claro se `DATABASE_URL` não
 * estiver configurada — assim a falha é diagnosticável, não um crash opaco.
 */
export function getDb(): PostgresJsDatabase<typeof schema> {
  if (dbInstance) {
    return dbInstance;
  }

  const connectionString = String(process.env.DATABASE_URL ?? '').trim();
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL não configurada — necessária para os caminhos servidos via Drizzle.',
    );
  }

  // `prepare: false` é obrigatório com o pooler do Supabase em modo transação
  // (PgBouncer, porta 6543), que não suporta prepared statements.
  // `max` baixo: o gateway serverless/efêmero não deve abrir muitas conexões
  // (o teto de conexões do Supabase free é baixo).
  sqlClient = postgres(connectionString, { prepare: false, max: 3 });
  dbInstance = drizzle(sqlClient, { schema });
  return dbInstance;
}

/** Fecha a conexão (útil em testes/encerramento gracioso). */
export async function closeDb(): Promise<void> {
  if (sqlClient) {
    await sqlClient.end({ timeout: 5 });
    sqlClient = null;
    dbInstance = null;
  }
}
