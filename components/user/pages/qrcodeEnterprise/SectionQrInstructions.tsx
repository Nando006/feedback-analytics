import { memo } from 'react';
import CardSimple from 'components/user/shared/cards/cardSimple';

const SectionQrInstructions = memo(function SectionQrInstructions() {
  return (
    <CardSimple>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-(--tertiary-color)/15">
            <span className="text-lg font-bold text-(--quinary-color)">1</span>
          </div>
          <h3 className="mb-2 font-semibold text-(--text-primary)">Baixe o QR Code</h3>
          <p className="text-sm text-(--text-tertiary)">
            Clique em "Download" para salvar a imagem
          </p>
        </div>

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
            <span className="text-lg font-bold text-emerald-300">2</span>
          </div>
          <h3 className="mb-2 font-semibold text-(--text-primary)">Imprima ou Compartilhe</h3>
          <p className="text-sm text-(--text-tertiary)">
            Coloque em locais visíveis ou compartilhe digitalmente
          </p>
        </div>

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-(--primary-color)/15">
            <span className="text-lg font-bold text-(--quaternary-color)">3</span>
          </div>
          <h3 className="mb-2 font-semibold text-(--text-primary)">Receba Feedback</h3>
          <p className="text-sm text-(--text-tertiary)">
            Clientes escaneiam e enviam feedback diretamente
          </p>
        </div>
      </div>
    </CardSimple>
  );
});

export default SectionQrInstructions;
