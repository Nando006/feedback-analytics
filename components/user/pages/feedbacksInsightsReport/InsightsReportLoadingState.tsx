export default function InsightsReportLoadingState() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-full max-w-2xl rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 text-center text-lg text-(--text-primary) glass-card">
        Carregando relatório de insights...
      </div>
    </div>
  );
}
