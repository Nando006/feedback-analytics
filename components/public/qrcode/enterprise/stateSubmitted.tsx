import Card from 'components/public/shared/card';
import SVGImageProfile from 'components/svg/imageProfile';

export default function StateSubmitted({
  enterpriseName,
}: {
  enterpriseName: string;
}) {
  return (
    <div className="min-h-screen bg-(--bg-primary) flex items-center justify-center p-4">
      <Card
        title="Feedback Enviado!"
        text="Obrigado por compartilhar sua experiência conosco"
        icon={<SVGImageProfile />}
        children={
          <div className="text-center">
            <div className="w-16 h-16 bg-(--positive)/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-(--positive)"
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
            <p className="text-(--text-secondary) mb-6 font-work-sans">
              Seu feedback foi recebido com sucesso e será analisado pela nossa
              equipe.
            </p>
            {enterpriseName && (
              <p className="font-work-sans text-sm text-(--text-tertiary) mb-6">
                <span className="font-medium">Empresa:</span> {enterpriseName}
              </p>
            )}
            <div className="bg-(--primary-color)/10 border border-(--primary-color)/20 rounded-lg p-4">
              <p className="text-(--primary-color) text-sm font-work-sans">
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
