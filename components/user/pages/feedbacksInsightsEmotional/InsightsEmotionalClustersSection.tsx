import type { InsightsEmotionalClustersSectionProps } from './ui.types';

import { sentimentLabel } from 'lib/utils/sentiment';

export default function InsightsEmotionalClustersSection({
  clusters,
}: InsightsEmotionalClustersSectionProps) {
  return (
    <div className="font-work-sans relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card space-y-6">
      <h3 className="text-base font-montserrat font-semibold text-[var(--text-primary)]">
        Momentos emocionais que mais se repetem
      </h3>
      <p className="mb-2 max-w-2xl text-sm text-[var(--text-tertiary)]">
        Explore exemplos reais de feedbacks que representam emoções mais fortes
        dos seus clientes — tanto positivas quanto negativas.
      </p>

      {clusters.length === 0 ? (
        <div className="text-sm text-[var(--text-tertiary)]">
          Ainda não há clusters emocionais suficientes para exibir.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {clusters.map((cluster) => (
            <div
              key={cluster.title}
              className="space-y-3 rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-4">
              <div>
                <h4 className="font-montserrat mb-1 text-sm font-semibold text-[var(--text-primary)]">
                  {cluster.title}
                </h4>
                <p className="text-xs text-[var(--text-tertiary)]">{cluster.description}</p>
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {cluster.items.map((item) => (
                  <div
                    key={item.id}
                    className="space-y-1 rounded-lg border border-(--quaternary-color)/10 bg-(--bg-tertiary) p-3">
                    <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
                      <span>
                        {new Date(item.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}
                      </span>
                      <span>
                        Rating: {item.rating ?? '—'} · {sentimentLabel(item.sentiment)}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-xs text-[var(--text-primary)]">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
