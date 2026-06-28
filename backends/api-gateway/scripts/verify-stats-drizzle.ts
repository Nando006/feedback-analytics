/**
 * Verificação de runtime da Etapa 01-3: roda as agregações de stats via Drizzle
 * direto contra o banco real, SEM subir o app nem fazer login.
 *
 * Uso (na pasta backends/api-gateway, com DATABASE_URL no .env):
 *   npm run verify:stats
 *
 * Para cada empresa, imprime os agregados de nota e de análise. Compare com o
 * que o dashboard mostra para a mesma empresa — devem bater.
 */
import 'dotenv/config';
import { getDb, closeDb } from '../src/db/client.js';
import { enterprise } from '../drizzle/schema.js';
import {
  fetchScopedRatingAggregates,
  fetchScopedAnalysisAggregates,
} from '../src/repositories/feedbackStats.repository.js';

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL ausente. Defina no backends/api-gateway/.env e tente de novo.');
    process.exit(1);
  }

  const db = getDb();

  const enterprises = await db
    .select({ id: enterprise.id, document: enterprise.document })
    .from(enterprise)
    .limit(10);

  if (enterprises.length === 0) {
    console.log('Nenhuma empresa encontrada. (O banco está vazio?)');
    await closeDb();
    return;
  }

  console.log(`Encontradas ${enterprises.length} empresa(s). Agregando stats via Drizzle...\n`);

  for (const ent of enterprises) {
    const rating = await fetchScopedRatingAggregates({
      enterpriseId: ent.id,
      collectionPointIds: null, // null = empresa inteira (escopo COMPANY/Geral)
    });
    const analysis = await fetchScopedAnalysisAggregates({
      enterpriseId: ent.id,
      collectionPointIds: null,
    });

    const averageRating =
      rating.totalFeedbacks > 0
        ? Math.round((rating.ratingSum / rating.totalFeedbacks) * 10) / 10
        : 0;

    console.log(`Empresa ${ent.id} (doc ${ent.document}):`);
    console.log(`  totalFeedbacks=${rating.totalFeedbacks}  averageRating=${averageRating}`);
    console.log(`  ratingDistribution=${JSON.stringify(rating.ratingDistribution)}`);
    console.log(
      `  totalAnalyzed=${analysis.totalAnalyzed}  pending=${rating.totalFeedbacks - analysis.totalAnalyzed}  latestAnalysisAt=${analysis.latestAnalysisAt ?? '—'}`,
    );
    console.log(`  aiCounts=${JSON.stringify(analysis.aiCounts)}\n`);
  }

  await closeDb();
  console.log('OK — as queries Drizzle rodaram contra o banco real.');
}

main().catch(async (err) => {
  console.error('Falha na verificação:', err);
  await closeDb();
  process.exit(1);
});
