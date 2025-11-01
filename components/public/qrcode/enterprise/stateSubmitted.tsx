import Card from 'components/public/shared/cards/card';
import SVGImageProfile from 'components/svg/imageProfile';

export default function StateSubmitted({
  enterpriseName,
}: {
  enterpriseName: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-800 flex items-center justify-center p-4">
      <Card
        title="Feedback Enviado!"
        text="Obrigado por compartilhar sua experiência conosco"
        icon={<SVGImageProfile />}
        children={
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-neutral-400 mb-6">
              Seu feedback foi recebido com sucesso e será analisado pela nossa
              equipe.
            </p>
            {enterpriseName && (
              <p className="text-sm text-neutral-500 mb-6">
                <span className="font-medium">Empresa:</span> {enterpriseName}
              </p>
            )}
            <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>Feedback registrado!</strong>
                <br />
                Este dispositivo poderá enviar um novo feedback amanhã.
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
}
