export default function Information() {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 lg:col-span-2">
      <h2 className="mb-4 text-lg font-semibold">Informações básicas</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="form-field">
          <label>Nome completo</label>
          <div className="skeleton h-10" />
        </div>
        <div className="form-field sm:col-span-2">
          <label>Sobre você</label>
          <div className="skeleton h-24" />
        </div>
      </div>
    </section>
  );
}
