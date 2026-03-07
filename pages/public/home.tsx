import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-(--bg-color) text-white">
        {/* Hero */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-(--secondary-color)/10 via-transparent to-transparent pointer-events-none" />
          <div className="container mx-auto px-6 py-16 md:py-24">
            <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] items-center">
              <div className="space-y-6">
                <p className="font-work-sans inline-flex items-center rounded-full border border-(--secondary-color) bg-(--primary-color)/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-(--text-primary)">
                  Feedback Analytics · IA
                </p>
                <h1 className="font-montserrat text-3xl leading-tight font-semibold md:text-4xl lg:text-5xl text-(--text-primary)">
                  Entenda seus clientes com análises inteligentes e rápidas.
                </h1>
                <p className="text-lg text-(--text-secondary) md:text-xl font-work-sans">
                  Colete, interprete e transforme feedbacks em decisões
                  concretas. Acompanhe sentimentos, tendências e recomendações
                  da IA em um só lugar.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/register"
                    className="font-poppins rounded-lg bg-(--secondary-color) px-5 py-3 text-sm font-semibold text-(--text-button) transition hover:bg-(--secondary-color-dark)">
                    Começar agora
                  </Link>
                  <button
                    onClick={() => setShowVideo(true)}
                    className="font-poppins rounded-lg border border-(--container-border) px-5 py-3 text-sm font-semibold text-(--text-primary) transition hover:border-(--text-primary) hover:bg-(--container-secondary) cursor-pointer">
                    Ver como funciona
                  </button>
                </div>
                <div className="font-work-sans flex flex-row gap-2 lg:gap-6 text-sm text-(--text-muted)">
                  <span>Insights em tempo real</span>
                  <span className="w-[1px] bg-(--text-muted)" />
                  <span>Relatórios visuais</span>
                  <span className="w-[1px] bg-(--text-muted)" />
                  <span>Configuração rápida</span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-10 bg-(--secondary-color)/20" />
                <div className="relative rounded-2xl border border-(--container-border) bg-(--container-primary)/60 p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-(--text-muted) font-work-sans">
                        Clima geral
                      </p>
                      <p className="font-work-sans text-2xl font-semibold text-(--positive)">
                        Positivo
                      </p>
                    </div>
                    <span className="rounded-full bg-(--positive)/20 px-3 py-1 text-xs font-semibold text-(--text-primary) font-poppins">
                      IA ativa
                    </span>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm text-(--text-secondary) font-work-sans">
                        <span>Positivos</span>
                        <span>62%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-(--container-secondary)">
                        <div
                          className="h-2 rounded-full bg-(--positive)"
                          style={{ width: '62%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm text-(--text-secondary) font-work-sans">
                        <span>Neutros</span>
                        <span>24%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-(--container-secondary)">
                        <div
                          className="h-2 rounded-full bg-(--neutral)"
                          style={{ width: '24%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm text-(--text-secondary) font-work-sans">
                        <span>Negativos</span>
                        <span>14%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-(--container-secondary)">
                        <div
                          className="h-2 rounded-full bg-(--negative)"
                          style={{ width: '14%' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 rounded-xl border border-(--container-border) bg-(--container-primary)/60 p-4">
                    <p className="text-sm font-semibold text-(--text-primary) font-work-sans">
                      Recomendações da IA
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-(--text-secondary) font-work-sans">
                      <li>• Reforce canais que receberam elogios recentes.</li>
                      <li>
                        • Aja rápido em filas de atendimento mais citadas.
                      </li>
                      <li>
                        • Monitore produtos com menções neutras para melhorar.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Destaques rápidos */}
        <section className="container mx-auto px-6 pb-16 md:pb-20">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Insights imediatos',
                desc: 'Relatórios prontos, sem esforço manual, em minutos.',
              },
              {
                title: 'Sentimentos & tendências',
                desc: 'Veja clima, picos de menções e o que mais impacta clientes.',
              },
              {
                title: 'Decisões orientadas por IA',
                desc: 'Sugestões de ação claras para priorizar o que importa.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-(--container-border) bg-(--container-primary)/60 p-5 shadow-lg hover:shadow-md transition cursor-pointer">
                <h3 className="text-lg font-semibold text-(--text-primary) font-montserrat">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-(--text-secondary) font-work-sans">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="container mx-auto flex items-center justify-between px-6 pb-10 text-xs text-(--text-muted) font-work-sans">
          <span>Feedback Analytics</span>
          <span>Versão: {__APP_VERSION__}</span>
        </footer>
      </div>
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-4xl rounded-2xl border border-(--container-border) bg-(--container-primary)/90 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-(--container-border) px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-(--secondary-color) font-poppins">
                  Demo em vídeo
                </p>
                <h3 className="text-lg font-semibold text-(--text-primary) font-montserrat">
                  Veja o produto em ação
                </h3>
              </div>
              <button
                onClick={() => setShowVideo(false)}
                className="font-poppins cursor-pointer rounded-full border border-(--container-border) px-3 py-1 text-sm text-(--text-secondary) hover:border-(--text-primary) hover:bg-(--container-secondary)">
                Fechar
              </button>
            </div>
            <div className="aspect-video w-full bg-(--bg-color) flex items-center justify-center text-(--text-muted) text-sm font-work-sans">
              {/* Espaço reservado para o vídeo. Substitua pelo embed quando o vídeo estiver pronto. */}
              Vídeo de demonstração será adicionado aqui.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
