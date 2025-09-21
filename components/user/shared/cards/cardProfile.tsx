import SVGImageProfile from 'components/svg/imageProfile';
import { logout } from 'lib/services/logout';
import type { PropsApiEnterpriseResponse } from 'lib/interfaces/entities/enterprise';
import { useTruncatedText } from 'lib/utils/truncateText';
import { FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

export default function CardProfile({
  enterprise,
}: PropsApiEnterpriseResponse) {
  const navigate = useNavigate();

  const full_name = enterprise.full_name ?? '';
  const { display, props: domProps } = useTruncatedText(full_name, 15);

  async function handleSignOut() {
    await logout().catch(() => {});
    navigate('/login', { replace: true });
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
            title="Sair"
            aria-label="Sair"
            className="text-2xl cursor-pointer group">
            <FaSignOutAlt className="text-red-400 group-hover:text-red-500 duration-200" />
          </button>
        </div>
      </div>
    </Link>
  );
}
