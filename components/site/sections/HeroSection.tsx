import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const supportLink =
    'https://wa.me/5562996831370?text=Olá%2C%20gostaria%20de%20saber%20mais%20sobre%20a%20plataforma%20de%20Feedback%20IA.';

  return (
    <section className="relative min-h-[500px] overflow-hidden rounded-2xl">
      {/* Background com imagem e gradiente */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/HeroSection01.jpg"
          alt="Fundo tecnológico de IA"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-hover)]/90 via-[var(--color-primary-hover)]/80 to-black/60"></div>
      </div>

      {/* Elementos decorativos de fundo */}
      <div className="absolute -z-5 top-1/4 right-1/4 w-64 h-64 bg-[var(--color-primary-light)]/20 rounded-full blur-3xl"></div>
      <div className="absolute -z-5 bottom-0 left-0 w-80 h-80 bg-[var(--color-primary)]/10 rounded-full blur-3xl"></div>

      {/* Conteúdo principal */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center gap-10">
        <div className="md:w-1/2 text-white space-y-6">
          <h2
            style={{ fontFamily: 'var(--font-mont-serrat)' }}
            className="text-3xl md:text-5xl font-extrabold leading-tight"
          >
            Transforme Feedbacks em{' '}
            <span className="text-[var(--color-primary-light)]">Ações</span> com IA
          </h2>

          <div className="space-y-4">
            <p
              style={{ fontFamily: 'var(--font-poppins)' }}
              className="text-white/90 font-medium text-lg leading-relaxed border-l-4 border-[var(--color-primary-light)] pl-4 py-1"
            >
              Você sabe o que seus clientes realmente pensam sobre sua empresa?
              A falta de um canal estruturado para coletar e analisar feedbacks
              pode impactar diretamente a melhoria contínua dos seus produtos e
              serviços.
            </p>

            <p
              style={{ fontFamily: 'var(--font-poppins)' }}
              className="text-white/80 font-medium text-lg leading-relaxed"
            >
              Nosso sistema de Gestão de Feedback com IA resolve esse problema
              ao automatizar a coleta, análise e extração de insights para
              impulsionar o crescimento do seu negócio.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <a
              href={supportLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                label="Fale Conosco"
                icon="pi pi-whatsapp"
                className="w-fit shadow-md hover:shadow-lg transition-all duration-300 bg-[var(--color-primary-light)] hover:bg-[var(--color-primary)] border-none px-4 py-2 rounded-md font-bold"
              />
            </a>

            <Link to="#">
              <Button
                label="Começar Agora"
                icon="pi pi-arrow-right"
                className="w-fit shadow-md hover:shadow-lg transition-all duration-300 p-button-outlined text-white border-2 border-white/70 hover:border-white rounded-md px-4 py-2 font-bold"
              />
            </Link>
          </div>
        </div>

        <div className="md:w-1/2 mt-6 md:mt-0">
          <div className="relative w-full aspect-square max-w-md mx-auto">
            {/* Imagem principal */}
            <div className="absolute top-0 left-0 w-4/5 h-4/5 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/images/HeroSection01.jpg"
                alt="IA analisando feedback"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-hover)]/30 to-transparent"></div>
            </div>

            {/* Imagem decorativa secundária */}
            <div className="absolute bottom-0 right-0 w-3/5 h-3/5 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/images/HeroSection02.png"
                alt="Processamento de dados IA"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-primary)]/40"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
