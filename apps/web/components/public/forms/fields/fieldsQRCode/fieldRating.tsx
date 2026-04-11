import type { FieldRatingProps } from './ui.types';

export default function FieldRating({ rating, onRatingChange }: FieldRatingProps) {
  const ratingLabels = {
    1: 'Muito insatisfeito',
    2: 'Insatisfeito',
    3: 'Neutro',
    4: 'Satisfeito',
    5: 'Muito satisfeito',
  };

  return (
    <div>
      <label className="font-work-sans block text-sm font-medium text-(--text-primary) mb-3">
        Como você avalia sua experiência?
      </label>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`w-12 h-12 rounded-full transition-all duration-200 ${
              star <= rating
                ? 'bg-(--neutral) text-white scale-110'
                : 'bg-(--bg-tertiary) text-(--text-secondary) hover:bg-(--bg-secondary)'
            }`}>
            <svg
              className="w-6 h-6 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-center text-sm text-(--text-secondary) mt-2">
          {ratingLabels[rating as keyof typeof ratingLabels]}
        </p>
      )}
    </div>
  );
}
