export default function Statistics() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 shadow-[var(--shadow-secondary)] transition-shadow hover:shadow-[var(--shadow-primary)]">
        <div className="flex items-center gap-3">
          <div className="icon-bubble">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4">
              <path d="M7 8h10M7 12h6m-6 4h10" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Feedbacks</p>
            <p className="text-xl font-semibold">—</p>
          </div>
        </div>
      </div>
      <div className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 shadow-[var(--shadow-secondary)] transition-shadow hover:shadow-[var(--shadow-primary)]">
        <div className="flex items-center gap-3">
          <div className="icon-bubble">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4">
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Positivos</p>
            <p className="text-xl font-semibold">—</p>
          </div>
        </div>
      </div>
      <div className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 shadow-[var(--shadow-secondary)] transition-shadow hover:shadow-[var(--shadow-primary)]">
        <div className="flex items-center gap-3">
          <div className="icon-bubble">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4">
              <path d="M15 12l-2-2-4 4" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Negativos</p>
            <p className="text-xl font-semibold">—</p>
          </div>
        </div>
      </div>
      <div className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 shadow-[var(--shadow-secondary)] transition-shadow hover:shadow-[var(--shadow-primary)]">
        <div className="flex items-center gap-3">
          <div className="icon-bubble">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4">
              <path d="M12 6v12m6-6H6" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">NPS</p>
            <p className="text-xl font-semibold">—</p>
          </div>
        </div>
      </div>
    </section>
  );
}
