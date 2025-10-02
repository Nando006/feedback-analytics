import HeroSection from "components/site/sections/HeroSection";
import FeatureSection from "components/site/sections/FeatureSection";

export default function Home() {

    // Dados para o componente SimpleCarousel
  const featuresData = {
    simpleCard_1: {
      title: "Coleta Inteligente",
      description: "Receba feedbacks via QR Code, e-mail e WhatsApp.",
    },
    simpleCard_2: {
      title: "Análise com IA",
      description: "Tome melhores decisões com auxilio da poderosa IA",
    },
    simpleCard_3: {
      title: "Tomadas de Decisões",
      description:
        "Identifique sentimentos, temas recorrentes e pontos de melhoria.",
    },
    simpleCard_4: {
      title: "Dashboard Interativo",
      description:
        "Visualize insights valiosos e tome decisões estratégicas com base em dados.",
    },
  };


  return (
    <div className="px-12 py-10">
      <HeroSection />
      <FeatureSection features={featuresData} />
    </div>
  );
}
