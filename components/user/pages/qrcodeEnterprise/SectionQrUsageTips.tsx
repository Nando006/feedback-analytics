import CardSimple from 'components/user/shared/cards/cardSimple';
import { FaLightbulb } from 'react-icons/fa';

export default function SectionQrUsageTips() {
  return (
    <CardSimple>
      <div className="space-y-6">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <FaLightbulb className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-neutral-100">Dicas de Uso</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400"></div>
            <div>
              <h4 className="mb-1 font-semibold text-neutral-100">Locais Estratégicos</h4>
              <p className="text-sm text-neutral-400">
                Coloque o QR Code em mesas, balcões, recepção ou áreas de espera
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-400"></div>
            <div>
              <h4 className="mb-1 font-semibold text-neutral-100">Tamanho Adequado</h4>
              <p className="text-sm text-neutral-400">
                Imprima em tamanho mínimo de 3x3cm para facilitar a leitura
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-purple-400"></div>
            <div>
              <h4 className="mb-1 font-semibold text-neutral-100">Incentive o Uso</h4>
              <p className="text-sm text-neutral-400">
                Adicione uma mensagem como "Sua opinião é importante! Escaneie e nos conte"
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-yellow-400"></div>
            <div>
              <h4 className="mb-1 font-semibold text-neutral-100">Monitore Regularmente</h4>
              <p className="text-sm text-neutral-400">
                Acompanhe os feedbacks recebidos no dashboard para melhorar continuamente
              </p>
            </div>
          </div>
        </div>
      </div>
    </CardSimple>
  );
}
