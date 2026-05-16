import { useNavigation, useRouteLoaderData } from "react-router-dom";
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
    <div className="font-work-sans space-y-6">
      <Header
        enterprise={enterprise}
        user={user}
        description="Veja suas informações pessoais. Mantenha seus dados atualizados para uma melhor experiência."
        nextLink="/user/edit/types-feedback"
        nextLabelLink="Configurações Premium"
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

      <div className="relative">
        <CardSimple
          type="accordion"
          title="O que é Sua Empresa ?"
          description="Preencha os dados corretamente! Esses dados são muito relevantes para um serviço de qualidade. "
        >
          <FormCollectingDataEnterprise />
        </CardSimple>
      </div>
    </div>
  );
}
