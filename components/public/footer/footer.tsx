function footer() {
  return (
    <footer className="bg-[var(--color-surface)]/95 backdrop-blur-xl border-t border-[var(--color-border)]/50 px-4 lg:px-8 py-6 mt-auto relative overflow-hidden">
      {/* Gradiente de fundo */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/5 via-transparent to-[var(--color-secondary)]/5 pointer-events-none" />

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Copyright */}
        <div className="flex items-center gap-2">
          <p className="text-sm text-[var(--color-text-muted)] font-medium">
            © 2024
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent font-bold mx-1">
              Feedback IA
            </span>
            Todos os direitos reservados.
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm">
          <a
            href="/politica-de-privacidade"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all duration-200 hover:scale-105 relative group">
            Política de Privacidade
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] group-hover:w-full transition-all duration-300" />
          </a>

          <div className="w-1 h-1 bg-[var(--color-text-muted)]/40 rounded-full" />

          <a
            href="/termos-de-uso"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all duration-200 hover:scale-105 relative group">
            Termos de Uso
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] group-hover:w-full transition-all duration-300" />
          </a>

          <div className="w-1 h-1 bg-[var(--color-text-muted)]/40 rounded-full" />

          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--color-elevation-low)]/50 rounded-full border border-[var(--color-border)]/30">
            <div className="w-1.5 h-1.5 bg-[var(--color-success)] rounded-full animate-pulse" />
            <span className="text-xs text-[var(--color-text-muted)] font-medium">
              v1.0.0
            </span>
          </div>
        </div>
      </div>

      {/* Decoração inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)]/20 to-transparent" />
    </footer>
  );
}

export default footer;
