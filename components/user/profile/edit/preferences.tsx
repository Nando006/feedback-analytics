import CardSimple from 'components/user/shared/cards/cardSimple';

export default function Preferences() {
  return (
    <CardSimple>
      <div>
        <h2 className="mb-4 text-lg font-semibold">Preferências</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="form-field">
            <label>Tema</label>
            <div className="skeleton h-10" />
          </div>
        </div>
      </div>
    </CardSimple>
  );
}
