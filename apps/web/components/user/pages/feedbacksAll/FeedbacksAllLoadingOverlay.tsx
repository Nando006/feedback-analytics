export default function FeedbacksAllLoadingOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/35">
      <div className="relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
        <div className="font-work-sans text-center text-(--text-primary)">Carregando...</div>
      </div>
    </div>
  );
}
