import { useParams } from 'react-router-dom';

export default function Feedbacks() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>Feedback #{id}</h1>
      {/* Aqui você pode buscar e exibir os dados do feedback específico */}
    </div>
  );
}
