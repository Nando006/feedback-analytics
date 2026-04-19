import type { SkeletonBlockProps } from './ui.types';

export default function SkeletonBlock({ className = '' }: SkeletonBlockProps) {
  return <div className={`animate-pulse rounded-lg bg-(--seventh-color) ${className}`} />;
}
