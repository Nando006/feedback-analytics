import { memo } from 'react';
import CardSimple from 'components/user/shared/cards/cardSimple';
import { FaLightbulb } from 'react-icons/fa';

const SectionQrUsageTips = memo(function SectionQrUsageTips() {
  return (
    <CardSimple>
      <div className="space-y-6">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-(--primary-color) to-(--secondary-color)">
              <FaLightbulb className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-(--text-primary)">Dicas de Uso</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-(--tertiary-color)"></div>
            <div>
              <h4 className="mb-1 font-semibold text-(--text-primary)">Locais Estratégicos</h4>
              <p className="text-sm text-(--text-tertiary)">
                Coloque o QR Code em mesas, balcões, recepção ou áreas de espera
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400"></div>
            <div>
              <h4 className="mb-1 font-semibold text-(--text-primary)">Tamanho Adequado</h4>
              <p className="text-sm text-(--text-tertiary)">
                Imprima em tamanho mínimo de 3x3cm para facilitar a leitura
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-(--quaternary-color)"></div>
            <div>
              <h4 className="mb-1 font-semibold text-(--text-primary)">Incentive o Uso</h4>
              <p className="text-sm text-(--text-tertiary)">
                Adicione uma mensagem como "Sua opinião é importante! Escaneie e nos conte"
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-400"></div>
            <div>
              <h4 className="mb-1 font-semibold text-(--text-primary)">Monitore Regularmente</h4>
              <p className="text-sm text-(--text-tertiary)">
                Acompanhe os feedbacks recebidos no dashboard para melhorar continuamente
              </p>
            </div>
          </div>
        </div>
      </div>
    </CardSimple>
  );
});

export default SectionQrUsageTips;
