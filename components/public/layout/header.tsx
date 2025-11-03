import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <nav className="p-5 flex items-center justify-between shadow-md bg-neutral-900/20">
      <div>
        <Link to="/">
          <h1 className="text-2xl font-inter font-medium">
            Feedback Analytics
          </h1>
        </Link>
      </div>
      <div>
        <ul className="flex flex-row space-x-5">
          <li>
            <Link
              to="/login"
              className="">
              Login
            </Link>
          </li>
          <li>
            <Link to="/register">Registrar-se</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
