import type { FieldMessageProps } from './ui.types';


export default function FieldMessage({ message, onMessageChange }: FieldMessageProps) {
  return (
    <div>
      <label
        htmlFor="message"
        className="block text-sm font-medium text-neutral-200 mb-2">
        Conte-nos mais sobre sua experiência
      </label>
      <textarea
        id="message"
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder="Descreva sua experiência, sugestões ou comentários..."
        rows={4}
        className="w-full px-4 py-3 border border-neutral-700 rounded-lg bg-neutral-800 text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        required
      />
    </div>
  );
}
