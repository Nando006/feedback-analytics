import { useRouteLoaderData } from "react-router-dom";
import type {
  Enterprise,
} from "lib/interfaces/entities/enterprise.entity";
import type { AuthUser } from "lib/interfaces/entities/auth-user.entity";
import Information from "components/user/pages/profile/editUser/information";
import SettingsPageHeader from "components/user/shared/settingsPageHeader";

export default function Profile() {
  const { enterprise, user } = useRouteLoaderData("user") as {
    enterprise: Enterprise;
    user: AuthUser["user"];
  };

  const fullName = user.user_metadata?.full_name || enterprise.full_name || "";
  const email = user.email || "";
  const phone = user.phone || "";
  return (
    <div className="rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 lg:p-8 glass-card">
      <div className="font-work-sans space-y-6">
        <SettingsPageHeader
          title="Perfil do Usuário"
          description="Gerencie suas informações pessoais e de acesso ao sistema."
        />

        <div className="relative space-y-8">
          <Information
            defaultFullName={fullName}
            defaultEmail={email}
            defaultPhone={phone}
          />
        </div>
      </div>
    </div>
  );
}
