'use client';
import featuredImage from 'src/assets/images/FeatureSection01.jpg';
import MotionCarrossel from 'components/site/carousel/motionCarrossel';
import SectionTitle from './components/SectionTitle';
import type { IFeatureSectionProps } from 'lib/interfaces/site/section';

// Componente para exibir os recursos da plataforma
export default function FeatureSection({ features }: IFeatureSectionProps) {
  return (
    <section className="relative py-16 overflow-hidden bg-gradient-to-b from-[var(--color-surface)] to-transparent rounded-2xl">
      {/* Elementos decorativos */}
      <div className="absolute -z-10 top-1/2 left-1/4 w-32 h-32 bg-[var(--color-primary-light)]/10 rounded-full blur-2xl"></div>
      <div className="absolute -z-10 bottom-0 right-1/4 w-48 h-48 bg-[var(--color-primary)]/5 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto px-8">
        <SectionTitle
          title="Como Funciona?"
          subtitle="Nossa plataforma simplifica todo o processo de gestão de feedbacks com recursos poderosos"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <MotionCarrossel data={features} />
          </div>

          <div className="order-1 md:order-2 relative">
            <div className="relative aspect-video mx-auto rounded-xl overflow-hidden shadow-xl">
              <img
                src={featuredImage}
                alt="Gestão de feedbacks"
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
                loading='lazy'
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary-hover)]/30 to-transparent"></div>
            </div>

            {/* Elementos decorativos */}
            {/* <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-xl overflow-hidden shadow-lg rotate-6 hidden md:block scale-75">
              <img
                src="https://cdn.pixabay.com/photo/2017/05/16/15/08/courses-2318035_1280.jpg"
                alt="Profissional usando IA"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 0, 15vw"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent"></div>
            </div> */}

            {/* Badge em destaque */}
            <div className="absolute -top-4 -right-4 bg-white p-3 rounded-lg shadow-lg transform rotate-3 hidden md:block">
              <div className="text-[var(--color-primary)] font-semibold flex items-center gap-2">
                <span className="pi pi-star-fill"></span>
                <span>Análise em tempo real</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
