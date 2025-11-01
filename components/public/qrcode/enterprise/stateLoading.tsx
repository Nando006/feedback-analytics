import Card from 'components/public/shared/card';
import SVGImageProfile from 'components/svg/imageProfile';

export default function StateLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-800 flex items-center justify-center p-4">
      <Card
        title="Validando..."
        text="Verificando informações da empresa"
        icon={<SVGImageProfile />}
        children={
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-400 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <p className="text-neutral-400">
              Aguarde enquanto validamos as informações...
            </p>
          </div>
        }
      />
    </div>
  );
}
