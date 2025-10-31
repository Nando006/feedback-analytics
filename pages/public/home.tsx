import HeroSection from "components/site/sections/HeroSection";
import FeatureSection from "components/site/sections/FeatureSection";

export default function Home() {
  type FeatureKey = 'simpleCard_1' | 'simpleCard_2' | 'simpleCard_3' | 'simpleCard_4';

  const featuresData: Record<FeatureKey, { title: string; description: string }> = {
    simpleCard_1: {
      title: "Coleta Inteligente",
      description: "Receba feedbacks via QR Code, e-mail e WhatsApp.",
    },
    simpleCard_2: {
      title: "Análise com IA",
      description: "Tome melhores decisões com auxilio da poderosa IA.",
    },
    simpleCard_3: {
      title: "Tomadas de Decisões",
      description: "Identifique sentimentos, temas recorrentes e pontos de melhoria.",
    },
    simpleCard_4: {
      title: "Dashboard Interativo",
      description: "Visualize insights valiosos e tome decisões estratégicas com base em dados.",
    },
  };

  const featuresWithId = (Object.keys(featuresData) as FeatureKey[]).map((key) => ({
    title: featuresData[key].title,
    description: featuresData[key].description,
  }));

  return (
    <div className="px-12 py-10 gap-10 flex flex-col">
      <HeroSection />
      <FeatureSection features={featuresWithId} />
    </div>
  );
}