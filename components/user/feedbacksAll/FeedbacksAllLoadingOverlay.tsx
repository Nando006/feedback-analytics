export default function FeedbacksAllLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 glass-card">
        <div className="text-center text-[var(--text-primary)]">Carregando...</div>
      </div>
    </div>
  );
}
