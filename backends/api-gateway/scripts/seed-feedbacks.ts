import 'dotenv/config';
import { getDb, closeDb } from '../src/db/client.js';
import { enterprise, collectionPoints, feedback, feedbackAnalysis } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL ausente. Defina no .env e tente de novo.');
    process.exit(1);
  }

  const db = getDb();

  // 1. Obter todas as empresas cadastradas
  const enterprises = await db.select().from(enterprise);
  if (enterprises.length === 0) {
    console.error('Nenhuma empresa encontrada no banco de dados. Cadastre uma empresa primeiro no app.');
    await closeDb();
    process.exit(1);
  }

  console.log(`Encontradas ${enterprises.length} empresa(s). Semeando feedbacks de teste...`);

  const now = new Date();

  // Helper para gerar datas retroativas
  const getDateDaysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  // Feedbacks do Período Principal (Últimos 30 dias - dias 2 a 14 atrás)
  const primaryFeedbacks = [
    { rating: 5, sentiment: 'positive', msg: 'Excelente atendimento, adorei o produto!', daysAgo: 2 },
    { rating: 5, sentiment: 'positive', msg: 'Melhor compra que fiz nos últimos tempos.', daysAgo: 3 },
    { rating: 4, sentiment: 'positive', msg: 'Muito bom, porém o prazo de entrega foi longo.', daysAgo: 5 },
    { rating: 3, sentiment: 'neutral', msg: 'Mediano, cumpre o papel básico.', daysAgo: 6 },
    { rating: 2, sentiment: 'neutral', msg: 'Poderia ser melhor no atendimento.', daysAgo: 9 },
    { rating: 5, sentiment: 'positive', msg: 'Super recomendo, nota dez.', daysAgo: 10 },
    { rating: 2, sentiment: 'negative', msg: 'O produto veio com defeito, exijo devolução.', daysAgo: 12 },
    { rating: 4, sentiment: 'positive', msg: 'Gostei bastante da qualidade do serviço.', daysAgo: 14 },
  ];

  // Feedbacks do Período de Referência (30 a 60 dias atrás)
  const referenceFeedbacks = [
    { rating: 3, sentiment: 'neutral', msg: 'Normal, nada de especial.', daysAgo: 32 },
    { rating: 3, sentiment: 'neutral', msg: 'Aceitável pelo preço cobrado.', daysAgo: 33 },
    { rating: 2, sentiment: 'negative', msg: 'Não gostei do suporte pós-venda.', daysAgo: 35 },
    { rating: 2, sentiment: 'negative', msg: 'O serviço deixou muito a desejar.', daysAgo: 38 },
    { rating: 1, sentiment: 'negative', msg: 'Muito ruim, não recomendo para ninguém.', daysAgo: 40 },
    { rating: 4, sentiment: 'positive', msg: 'Fui muito bem atendido pela equipe.', daysAgo: 45 },
    { rating: 3, sentiment: 'neutral', msg: 'Custo benefício regular.', daysAgo: 48 },
    { rating: 4, sentiment: 'positive', msg: 'Maravilhoso, voltarei mais vezes!', daysAgo: 55 },
  ];

  const allFeedbacks = [...primaryFeedbacks, ...referenceFeedbacks];

  for (const ent of enterprises) {
    // Obter ou criar ponto de coleta
    const cps = await db
      .select()
      .from(collectionPoints)
      .where(eq(collectionPoints.enterpriseId, ent.id))
      .limit(1);

    let targetCP = cps[0];
    if (!targetCP) {
      console.log(`Nenhum ponto de coleta para empresa ${ent.id}. Criando...`);
      const newCPs = await db
        .insert(collectionPoints)
        .values({
          enterpriseId: ent.id,
          name: 'Ponto de Teste QrCode',
          type: 'QR_CODE',
          status: 'ACTIVE',
        })
        .returning();
      targetCP = newCPs[0];
    }

    console.log(`Empresa: ${ent.id} | Ponto de coleta: ${targetCP.id}`);

    for (const f of allFeedbacks) {
      const createdAt = getDateDaysAgo(f.daysAgo);

      // Inserir feedback
      const [insertedFeedback] = await db
        .insert(feedback)
        .values({
          message: f.msg,
          rating: f.rating,
          collectionPointId: targetCP.id,
          enterpriseId: ent.id,
          createdAt,
        })
        .returning();

      // Inserir análise correspondente
      await db.insert(feedbackAnalysis).values({
        sentiment: f.sentiment,
        categories: ['Teste'],
        keywords: ['teste'],
        feedbackId: insertedFeedback.id,
        createdAt,
        sentimentScore: f.sentiment === 'positive' ? '0.9' : f.sentiment === 'negative' ? '-0.8' : '0.1',
        confidence: '0.95',
      });
    }
  }

  console.log(`Sucesso! Feedbacks retroativos semeados para todas as ${enterprises.length} empresas.`);
  await closeDb();
}

main().catch(async (err) => {
  console.error('Erro na semeadura:', err);
  await closeDb();
  process.exit(1);
});
