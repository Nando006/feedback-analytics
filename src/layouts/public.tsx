import { Outlet } from 'react-router-dom';

export default function Public() {
  return (
    <div className="background-color color">
      <Outlet />
    </div>
  );
}
