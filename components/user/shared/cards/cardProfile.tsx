import SVGImageProfile from 'components/svg/imageProfile';
import { useTruncatedText } from 'lib/utils/truncateText';
import { FaSignOutAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

type CardProfileProps = {
  fullName?: string;
  onSignOut: () => void;
  isSigningOut?: boolean;
};

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
    // From Uiverse.io by aadium
    <Link
      to="/user/profile"
      title="Ver perfil"
      aria-label="Ver perfil"
      className="w-full h-[240px] p-2.5 bg-neutral-900 shadow-inner shadow-neutral-900/60 hover:bg-neutral-800/5 duration-200">
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
            className="text-2xl cursor-pointer group disabled:opacity-60">
            <FaSignOutAlt className="text-red-400 group-hover:text-red-500 duration-200" />
          </button>
        </div>
      </div>
    </Link>
  );
}
