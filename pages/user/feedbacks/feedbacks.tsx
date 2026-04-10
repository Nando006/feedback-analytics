import { useParams } from 'react-router-dom';

export default function Feedbacks() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="font-work-sans space-y-6 pb-8">
      <div className="relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
        <h1 className="font-montserrat text-2xl font-semibold tracking-tight text-(--text-primary)">
          Feedback #{id}
        </h1>
        <p className="mt-2 text-sm text-(--text-tertiary)">
          Esta visualizacao individual ainda nao foi detalhada, mas ja segue o
          padrao visual da area privada.
        </p>
      </div>
    </div>
  );
}
