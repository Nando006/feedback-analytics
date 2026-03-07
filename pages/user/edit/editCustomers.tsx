import CardSimple from 'components/user/shared/cards/cardSimple';

export default function EditCustomer() {
  return (
    <div className="font-inter space-y-6 pb-8">
      <CardSimple type="header">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-(--text-tertiary)">
            Em breve
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-(--text-primary) md:text-3xl">
            Clientes
          </h1>
          <p className="text-sm text-(--text-secondary)">
            Esta área será usada para gerenciar e segmentar clientes dentro do workspace.
          </p>
        </div>
      </CardSimple>

      <CardSimple disableGlass>
        <div className="rounded-xl border border-dashed border-(--quaternary-color)/14 bg-(--seventh-color) px-5 py-8 text-center">
          <p className="text-sm font-medium text-(--text-primary)">
            A tela de clientes ainda não foi implementada.
          </p>
          <p className="mt-2 text-sm text-(--text-tertiary)">
            Quando essa etapa for construída, ela já herdará a mesma base visual da área privada.
          </p>
        </div>
      </CardSimple>
    </div>
  );
}
