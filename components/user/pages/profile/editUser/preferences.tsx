import CardSimple from 'components/user/shared/cards/cardSimple';

export default function Preferences() {
  return (
    <CardSimple>
      <div>
        <h2 className="mb-4 text-lg font-semibold text-(--text-primary)">Preferências</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-(--text-secondary)">Tema</label>
            <div className="h-10 rounded-lg border border-(--quaternary-color)/10 bg-(--seventh-color) animate-pulse" />
          </div>
        </div>
      </div>
    </CardSimple>
  );
}
