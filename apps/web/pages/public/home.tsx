import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [showVideo, setShowVideo] = useState(false);
  const highlights = [
    {
      title: 'Insights imediatos',
      desc: 'Relatórios prontos, sem esforço manual, em minutos.',
      accentBg: 'bg-(--primary-color)/12',
      accentText: 'text-(--primary-color)',
      bar: 'from-(--primary-color) to-(--secondary-color)',
    },
    {
      title: 'Sentimentos & tendências',
      desc: 'Veja clima, picos de menções e o que mais impacta clientes.',
      accentBg: 'bg-(--secondary-color)/12',
      accentText: 'text-(--secondary-color)',
      bar: 'from-(--secondary-color) to-(--tertiary-color)',
    },
    {
      title: 'Decisões orientadas por IA',
      desc: 'Sugestões de ação claras para priorizar o que importa.',
      accentBg: 'bg-(--quinary-color)/14',
      accentText: 'text-(--quaternary-color)',
      bar: 'from-(--quaternary-color) to-(--tertiary-color)',
    },
  ];

  return (
    <>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative">
          <div className="pointer-events-none absolute inset-0" />
          <div className="container mx-auto px-6 py-16 md:py-24">
            <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] items-center">
              <div className="font-work-sans space-y-6">
                <p className="inline-flex items-center rounded-full border border-(--quaternary-color)/24 bg-(--sixth-color)/14 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-(--primary-color)">
                  Feedback Analytics · IA
                </p>
                <h1 className="font-montserrat text-3xl leading-tight font-semibold md:text-4xl lg:text-5xl text-(--text-primary)">
                  Entenda seus clientes com análises inteligentes e rápidas.
                </h1>
                <p className="text-lg text-(--text-secondary) md:text-xl">
                  Colete, interprete e transforme feedbacks em decisões
                  concretas. Acompanhe sentimentos, tendências e recomendações
                  da IA em um só lugar.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/register"
                    className="font-poppins rounded-lg bg-gradient-to-r from-(--primary-color) via-(--secondary-color) to-(--tertiary-color) px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                    Começar agora
                  </Link>
                  <button
                    onClick={() => setShowVideo(true)}
                    className="font-poppins cursor-pointer rounded-lg border border-(--quaternary-color)/80 dark:border-(--quaternary-color)/14 bg-(--quinary-color)/6 px-5 py-3 text-sm font-semibold text-(--primary-color) transition-colors hover:bg-(--quinary-color) dark:hover:bg-(--quinary-color)/10">
                    Ver como funciona
                  </button>
                </div>
                <div className="flex flex-row gap-2 text-sm text-(--text-tertiary) lg:gap-6">
                  <span>Insights em tempo real</span>
                  <span className="w-[1px] bg-(--quaternary-color)/22" />
                  <span>Relatórios visuais</span>
                  <span className="w-[1px] bg-(--quaternary-color)/22" />
                  <span>Configuração rápida</span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-8 " />
                <div className="font-work-sans relative overflow-hidden rounded-2xl shadow-md border border-(--quaternary-color)/60  dark:border-(--quaternary-color)/14 dark:bg-linear-to-br dark:from-(--sixth-color) dark:to-(--seventh-color) bg-white p-6">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-(--primary-color) via-(--secondary-color) to-(--tertiary-color)" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-(--text-tertiary)">
                        Clima geral
                      </p>
                      <p className="text-2xl font-semibold text-(--positive)">
                        Positivo
                      </p>
                    </div>
                    <span className="rounded-full border border-(--quaternary-color)/24 bg-(--quinary-color)/14 px-3 py-1 text-xs font-semibold text-(--primary-color) font-poppins">
                      IA ativa
                    </span>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm text-(--text-secondary)">
                        <span>Positivos</span>
                        <span>62%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-(--bg-tertiary)">
                        <div
                          className="h-2 rounded-full bg-(--positive)"
                          style={{ width: '62%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm text-(--text-secondary)">
                        <span>Neutros</span>
                        <span>24%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-(--bg-tertiary)">
                        <div
                          className="h-2 rounded-full bg-(--neutral)"
                          style={{ width: '24%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm text-(--text-secondary)">
                        <span>Negativos</span>
                        <span>14%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-(--bg-tertiary)">
                        <div
                          className="h-2 rounded-full bg-(--negative)"
                          style={{ width: '14%' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 rounded-xl border border-(--quaternary-color)/80 dark:border-(--quaternary-color)/14 bg-linear-to-br from-(--quinary-color)/6 to-(--bg-secondary)/30 p-4">
                    <p className="text-sm font-semibold text-(--text-primary)">
                      Recomendações da IA
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-(--text-secondary)">
                      <li>
                        • Reforce canais que receberam elogios recentes.
                      </li>
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
            {highlights.map((item) => (
              <div
                key={item.title}
                className="font-work-sans cursor-pointer rounded-2xl border border-(--quaternary-color)/80 dark:border-(--quaternary-color)/14 dark:bg-linear-to-br dark:from-(--sixth-color) dark:to-(--seventh-color) bg-white p-5 transition hover:border-(--primary-color)/60 dark:hover:border-(--primary-color)/20 hover:bg-(--seventh-color) shadow-md hover:shadow-lg">
                <div className={`mb-4 h-1.5 w-20 rounded-full bg-gradient-to-r ${item.bar}`} />
                <span className={`font-poppins inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${item.accentBg} ${item.accentText}`}>
                  Destaque
                </span>
                <h3 className="text-lg font-semibold text-(--text-primary) font-montserrat">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-(--text-secondary)">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="container mx-auto flex items-center justify-between px-6 pb-10 text-xs text-(--text-tertiary) font-work-sans">
          <span>Feedback Analytics</span>
          <span>Versão: {__APP_VERSION__}</span>
        </footer>
      </div>
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--bg-primary)/80 px-4">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-(--quaternary-color)/14 bg-linear-to-br from-(--bg-secondary) to-(--bg-primary)">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-(--primary-color) via-(--secondary-color) to-(--tertiary-color)" />
            <div className="flex items-center justify-between border-b border-(--bg-tertiary) px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-(--quaternary-color) font-poppins">
                  Demo em vídeo
                </p>
                <h3 className="text-lg font-semibold text-(--text-primary) font-montserrat">
                  Veja o produto em ação
                </h3>
              </div>
              <button
                onClick={() => setShowVideo(false)}
                className="font-poppins cursor-pointer rounded-full border border-(--quaternary-color)/24 bg-(--quinary-color)/6 px-3 py-1 text-sm text-(--primary-color) transition-colors hover:bg-(--quinary-color)/10">
                Fechar
              </button>
            </div>
            <div className="flex aspect-video w-full items-center justify-center bg-(--bg-primary) text-(--text-tertiary) text-sm font-work-sans">
              {/* Espaço reservado para o vídeo. Substitua pelo embed quando o vídeo estiver pronto. */}
              Vídeo de demonstração será adicionado aqui.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
