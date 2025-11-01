import Card from 'components/public/shared/card';
import SVGImageProfile from 'components/svg/imageProfile';

export default function StateSentPreviousFeedback({
  enterpriseName,
}: {
  enterpriseName: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-800 flex items-center justify-center p-4">
      <Card
        title="Feedback Já Enviado"
        text="Este dispositivo já enviou feedback para esta empresa hoje"
        icon={<SVGImageProfile />}
        children={
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="text-neutral-400 mb-6">
              Obrigado! Este dispositivo já enviou feedback para esta empresa
              hoje. Você poderá enviar um novo feedback amanhã.
            </p>
            {enterpriseName && (
              <p className="text-sm text-neutral-500 mb-6">
                <span className="font-medium">Empresa:</span> {enterpriseName}
              </p>
            )}
            <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>Por que não posso enviar outro feedback?</strong>
                <br />
                Para evitar spam e garantir a qualidade dos feedbacks,
                permitimos apenas um feedback por dispositivo por empresa por
                dia.
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
}
