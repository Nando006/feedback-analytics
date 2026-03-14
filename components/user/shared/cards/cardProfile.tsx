import SVGImageProfile from 'components/svg/imageProfile';
import { useTruncatedText } from 'lib/utils/truncateText';
import { FaSignOutAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import type { CardProfileProps } from './ui.types';

export default function CardProfile({
  fullName,
  onSignOut,
  isSigningOut = false,
}: CardProfileProps) {
  const full_name = fullName ?? '';
  const { display, props: domProps } = useTruncatedText(full_name, 15);

  function handleSignOut(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onSignOut();
  }

  return (
    <Link
      to="/user/profile"
      title="Ver perfil"
      aria-label="Ver perfil"
      className="h-[240px] w-full border-t border-(--quaternary-color)/8 bg-linear-to-b from-(--bg-secondary) to-(--sixth-color) p-2.5 dark:shadow-inner dark:shadow-black/20 transition-colors duration-200 hover:bg-(--bg-secondary)">
      <div className="flex flex-col items-center h-full justify-between">
        <div className="flex flex-col items-center">
          <div className="profileimage">
            <SVGImageProfile />
          </div>
          <div className="Name">
            <span {...domProps}>{display}</span>
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            title="Sair"
            aria-label="Sair"
            className="group cursor-pointer text-2xl disabled:opacity-60 font-poppins">
            <FaSignOutAlt className="text-(--negative) transition-colors duration-200 group-hover:text-red-400" />
          </button>
        </div>
      </div>
    </Link>
  );
}
