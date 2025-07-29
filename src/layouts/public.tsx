import { Outlet } from 'react-router-dom';

export default function Public() {
  return (
    <div>
      Layout Público
      <Outlet />
    </div>
  );
}
