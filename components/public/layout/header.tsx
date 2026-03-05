import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <nav className="p-5 flex items-center justify-between shadow-md bg-(--header-color) border-b border-(--secondary-color)">
      <div>
        <Link to="/">
          <h1 className="font-montserrat text-2xl text-white font-semibold">
            Feedback Analytics
          </h1>
        </Link>
      </div>
      <div>
        <ul className="flex flex-row space-x-5">
          <li>
            <Link
              to="/register"
              className="font-poppins text-sm font-medium px-6 py-2 md:px-10 rounded-lg border border-(--color-primary) text-white hover:bg-(--color-primary)/50 transition-colors">
              Registrar
            </Link>
          </li>
          <li>
            <Link
              to="/login"
              className="font-poppins text-sm font-medium px-6 py-2 md:px-10 rounded-lg bg-(--primary-color) text-white hover:bg-(--primary-color-dark) transition-colors">
              Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
