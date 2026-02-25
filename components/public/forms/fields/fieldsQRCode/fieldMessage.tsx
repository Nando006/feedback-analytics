import type { FieldMessageProps } from './ui.types';


export default function FieldMessage({ message, onMessageChange }: FieldMessageProps) {
  return (
    <div>
      <label
        htmlFor="message"
        className="font-work-sans block text-sm font-medium text-(--text-primary) mb-2">
        Conte-nos mais sobre sua experiência
      </label>
      <textarea
        id="message"
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder="Descreva sua experiência, sugestões ou comentários..."
        rows={4}
        className="font-work-sans w-full px-4 py-3 border border-(--container-border) rounded-lg bg-(--container-secondary) text-(--text-primary) placeholder-(--text-secondary) focus:outline-none focus:ring-2 focus:ring-(--primary-color) focus:border-transparent resize-none"
        required
      />
    </div>
  );
}
