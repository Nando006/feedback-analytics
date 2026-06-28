import { defineConfig } from 'drizzle-kit';

/**
 * Configuração do drizzle-kit (introspecção, geração e aplicação de migrations).
 *
 * `schemaFilter: ['public']` é CRÍTICO: garante que a introspecção (`db:pull`) e
 * as migrations (`db:generate`/`db:migrate`) atuem APENAS no schema `public` que
 * o projeto possui — nunca no schema `auth`, gerenciado pelo Supabase.
 *
 * Requer a variável de ambiente DATABASE_URL apontando para o Postgres do
 * Supabase. Recomendado usar o pooler em modo SESSION (porta 5432) para o
 * drizzle-kit; o app em runtime usa o pooler em modo TRANSAÇÃO (6543) com
 * prepare:false (ver src/db/client.ts).
 */
export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  schemaFilter: ['public'],
  verbose: true,
  strict: true,
});
