// Components section
export interface IProcessStepCardProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export interface ISectionTitleProps {
  title: string;
  subtitle?: string;
  light?: boolean;
  center?: boolean;
}

export interface IStatItemProps {
  value: string;
  label: string;
  gradientFrom: string;
  gradientTo: string;
}

// Sections
export interface IFeatureItem {
  id?: string | number;
  title: string;
  description: string;
}

export interface IFeatureSectionProps {
  // Agora aceita um array de features. Cada item pode ter um `id` opcional
  features: IFeatureItem[];
}

export interface IWelcomeSectionProps {
  className?: string;
}
