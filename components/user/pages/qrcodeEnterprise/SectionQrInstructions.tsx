import CardSimple from 'components/user/shared/cards/cardSimple';

export default function SectionQrInstructions() {
  return (
    <CardSimple>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20">
            <span className="text-lg font-bold text-blue-400">1</span>
          </div>
          <h3 className="mb-2 font-semibold text-neutral-100">Baixe o QR Code</h3>
          <p className="text-sm text-neutral-400">
            Clique em "Download" para salvar a imagem
          </p>
        </div>

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-600/20">
            <span className="text-lg font-bold text-green-400">2</span>
          </div>
          <h3 className="mb-2 font-semibold text-neutral-100">Imprima ou Compartilhe</h3>
          <p className="text-sm text-neutral-400">
            Coloque em locais visíveis ou compartilhe digitalmente
          </p>
        </div>

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/20">
            <span className="text-lg font-bold text-purple-400">3</span>
          </div>
          <h3 className="mb-2 font-semibold text-neutral-100">Receba Feedback</h3>
          <p className="text-sm text-neutral-400">
            Clientes escaneiam e enviam feedback diretamente
          </p>
        </div>
      </div>
    </CardSimple>
  );
}
