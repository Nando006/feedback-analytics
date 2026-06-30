import { and, eq, gte, lte, inArray, type SQL } from 'drizzle-orm';
import { feedback } from '../../drizzle/schema.js';

/**
 * Garante que nenhuma query tenant-scoped seja construída sem um enterprise_id.
 *
 * Como o Drizzle acessa o banco com uma role que IGNORA a RLS, esquecer o filtro
 * de empresa vazaria dados entre tenants. Aqui falhamos rápido e alto — é a
 * primeira linha de defesa do isolamento multi-tenant na aplicação.
 */
export function assertEnterpriseId(enterpriseId: string): void {
  if (!enterpriseId || typeof enterpriseId !== 'string') {
    throw new Error('Query tenant-scoped exige um enterprise_id não vazio.');
  }
}

/**
 * Condição WHERE para `feedback` SEMPRE filtrada por `enterprise_id`. Opcional:
 * restringe a um conjunto de `collection_point` ids (o escopo selecionado no
 * painel) e a um intervalo de datas (período selecionado). É o "helper único"
 * por onde passam as leituras de feedback via Drizzle, garantindo o isolamento por empresa.
 *
 * Convenção de `collectionPointIds`:
 * - `null`  => toda a empresa (sem recorte de escopo);
 * - array NÃO vazio => recorta por esses pontos de coleta;
 * - array VAZIO => "nenhum resultado" (escopo sem pontos) e DEVE ser tratado
 *   pelo chamador antes de chamar este helper (que só aceita `null` ou não vazio).
 */
export function scopedFeedbackWhere(
  enterpriseId: string,
  collectionPointIds?: string[] | null,
  startDate?: string | null,
  endDate?: string | null,
): SQL {
  assertEnterpriseId(enterpriseId);

  const conditions: SQL[] = [eq(feedback.enterpriseId, enterpriseId)];

  if (collectionPointIds && collectionPointIds.length > 0) {
    conditions.push(inArray(feedback.collectionPointId, collectionPointIds));
  }

  if (startDate) {
    conditions.push(gte(feedback.createdAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(feedback.createdAt, endDate));
  }

  return and(...conditions) as SQL;
}

