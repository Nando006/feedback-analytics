export default function Preferences() {
  return (
    <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h2 className="mb-4 text-lg font-semibold">Preferências</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="form-field">
          <label>Tema</label>
          <div className="skeleton h-10" />
        </div>
        <div className="form-field">
          <label>Idioma</label>
          <div className="skeleton h-10" />
        </div>
      </div>
    </section>
  );
}
