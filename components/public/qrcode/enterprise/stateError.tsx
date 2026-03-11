import Card from 'components/public/shared/card';
import SVGImageProfile from 'components/svg/imageProfile';

export default function StateError({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-(--bg-primary) flex items-center justify-center p-4">
      <Card
        title="Erro"
        text="Não foi possível carregar o formulário"
        icon={<SVGImageProfile />}
        children={
          <div className="text-center">
            <div className="w-16 h-16 bg-(--negative)/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-(--negative)"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-(--negative) mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-lg bg-(--negative) px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90">
              Tentar Novamente
            </button>
          </div>
        }
      />
    </div>
  );
}
