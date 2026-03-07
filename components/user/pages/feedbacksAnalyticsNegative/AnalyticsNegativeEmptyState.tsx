export default function AnalyticsNegativeEmptyState() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-full max-w-2xl rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 text-center text-(--text-tertiary) glass-card">
        Ainda não há feedbacks negativos analisados pela IA.
      </div>
    </div>
  );
}
