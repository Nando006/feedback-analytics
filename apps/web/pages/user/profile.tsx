import { useNavigation, useRouteLoaderData } from "react-router-dom";
import type {
  Enterprise,
} from "lib/interfaces/entities/enterprise.entity";
import type { AuthUser } from "lib/interfaces/entities/auth-user.entity";
import Information from "components/user/pages/profile/editUser/information";
import SettingsPageHeader from "components/user/shared/settingsPageHeader";
import { FaFloppyDisk } from "react-icons/fa6";

export default function Profile() {
  const { enterprise, user } = useRouteLoaderData("user") as {
    enterprise: Enterprise;
    user: AuthUser["user"];
  };
  const navigation = useNavigation();

  const fullName = user.user_metadata?.full_name || enterprise.full_name || "";
  const email = user.email || "";
  const phone = user.phone || "";
  const isSavingProfile =
    navigation.state === "submitting" &&
    navigation.formAction?.includes("/user/settings/profile");

  return (
    <div className="font-work-sans space-y-6">
      <SettingsPageHeader
        title="Perfil do Usuário"
        description="Gerencie suas informações pessoais e de acesso ao sistema."
        primaryAction={{
          label: 'Salvar Alterações',
          type: 'submit',
          form: 'form-profile-info',
          loading: isSavingProfile,
          icon: <FaFloppyDisk className="h-4 w-4" />,
        }}
      />

      <div className="relative space-y-8">
        <Information
          defaultFullName={fullName}
          defaultEmail={email}
          defaultPhone={phone}
        />

        {isSavingProfile && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-primary)/35 backdrop-blur-[1px]" />
        )}
      </div>
    </div>
  );
}
