import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <nav className="flex items-center justify-between border-b border-(--bg-tertiary) bg-[var(--bg-secondary)] shadow-md p-5">
      <div>
        <Link to="/">
          <h1 className="font-montserrat text-2xl text-(--text-primary) font-semibold">
            Feedback Analytics
          </h1>
        </Link>
      </div>
      <div>
        <ul className="flex flex-row space-x-5">
          <li>
            <Link
              to="/register"
              className="font-poppins rounded-lg border border-(--secondary-color) px-6 py-2 text-sm font-medium text-(--text-primary) transition-colors hover:bg-(--secondary-color)/12 md:px-10">
              Registrar
            </Link>
          </li>
          <li>
            <Link
              to="/login"
              className="font-poppins rounded-lg bg-(--secondary-color) px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 md:px-10">
              Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
