interface BtnCommonProps {
  label: string;
  color?:
    | 'default'
    | 'pink'
    | 'teal'
    | 'purple'
    | 'green'
    | 'red'
    | 'blue'
    | 'yellow'
    | 'orange';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  hasBorder?: boolean;
}

export default function BtnCommon({
  label,
  color = 'default',
  size = 'md',
  hasBorder = true,
}: BtnCommonProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'pink':
        return 'bg-pink-600 hover:bg-pink-500 active:bg-pink-600';
      case 'teal':
        return 'bg-teal-600 hover:bg-teal-500 active:bg-teal-600';
      case 'purple':
        return 'bg-purple-600 hover:bg-purple-500 active:bg-purple-600';
      case 'green':
        return 'bg-green-600 hover:bg-green-500 active:bg-green-600';
      case 'red':
        return 'bg-red-600 hover:bg-red-500 active:bg-red-600';
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-500 active:bg-blue-600';
      case 'yellow':
        return 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-500 text-black';
      case 'orange':
        return 'bg-orange-600 hover:bg-orange-500 active:bg-orange-600';
      case 'default':
      default:
        return 'bg-neutral-700 hover:bg-neutral-700/60 active:bg-neutral-700';
    }
  };

  const getBorderClasses = () => {
    if (!hasBorder) return '';

    switch (color) {
      case 'pink':
        return 'border border-pink-400';
      case 'teal':
        return 'border border-teal-400';
      case 'purple':
        return 'border border-purple-400';
      case 'green':
        return 'border border-green-400';
      case 'red':
        return 'border border-red-400';
      case 'blue':
        return 'border border-blue-400';
      case 'yellow':
        return 'border border-yellow-400';
      case 'orange':
        return 'border border-orange-400';
      case 'default':
      default:
        return 'border border-neutral-400';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-2 py-1 text-xs min-h-6 rounded-md';
      case 'sm':
        return 'px-3 py-1.5 text-sm min-h-8 rounded-md';
      case 'md':
        return 'px-4 py-2 text-base min-h-10 rounded-lg';
      case 'lg':
        return 'px-6 py-3 text-lg min-h-12 rounded-lg';
      default:
        return 'px-4 py-2 text-base min-h-10 rounded-lg';
    }
  };

  return (
    <button
      className={`cursor-pointer font-medium shadow-md duration-200 ${getColorClasses()} ${getBorderClasses()} ${getSizeClasses()}`}>
      {label}
    </button>
  );
}
