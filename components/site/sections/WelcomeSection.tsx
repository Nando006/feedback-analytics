import StatItem from './components/StatItem';

export default function WelcomeSection() {
  return (
    <div className={`space-y-8 text-center lg:text-left`}>
      {/* Badge de destaque */}
      <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-sm font-medium shadow-lg">
        <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
        Feedbacks +1000
      </div>

      {/* Título principal */}
      <div className="space-y-4">
        <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
          <span className="bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent-pink)] bg-clip-text text-transparent">
            Transforme
          </span>
          <br />
          <span className="text-[var(--color-text)]">Feedbacks em</span>
          <br />
          <span className="bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent-pink)] bg-clip-text text-transparent">
            Resultados
          </span>
        </h1>

        <p className="text-xl text-[var(--color-text-muted)] leading-relaxed max-w-md">
          Plataforma de IA que converte feedback de clientes em insights
          acionáveis para o crescimento do seu negócio.
        </p>
      </div>

      {/* Features destacadas */}
      <div className="space-y-4">
        <FeatureItem
          icon="check"
          text="Análise de sentimentos com IA"
          gradientFrom="var(--color-primary)"
          gradientTo="var(--color-secondary)"
        />

        <FeatureItem
          icon="check"
          text="Dashboard em tempo real"
          gradientFrom="var(--color-secondary)"
          gradientTo="var(--color-accent-pink)"
        />

        <FeatureItem
          icon="check"
          text="Integração multi-canal"
          gradientFrom="var(--color-accent-pink)"
          gradientTo="var(--color-primary)"
        />
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4 pt-8">
        <StatItem
          value="98%"
          label="Poder de Análise"
          gradientFrom="var(--color-primary)"
          gradientTo="var(--color-secondary)"
        />
        <StatItem
          value="24h"
          label="Setup"
          gradientFrom="var(--color-secondary)"
          gradientTo="var(--color-accent-pink)"
        />
        <StatItem
          value="+50%"
          label="ROI Médio"
          gradientFrom="var(--color-accent-pink)"
          gradientTo="var(--color-primary)"
        />
      </div>
    </div>
  );
}

interface FeatureItemProps {
  icon: string;
  text: string;
  gradientFrom: string;
  gradientTo: string;
}

function FeatureItem({
  text,
  gradientFrom,
  gradientTo,
}: FeatureItemProps) {
  return (
    <div className="flex items-center space-x-3 text-[var(--color-text-secondary)]">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{
          background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
        }}>
        <svg
          className="w-3 h-3 text-white"
          fill="currentColor"
          viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
}
