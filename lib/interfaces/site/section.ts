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
export interface IFeatureSectionProps {
  features: Record<string, { title: string; description: string }>;
}

export interface IWelcomeSectionProps {
  className?: string;
}
