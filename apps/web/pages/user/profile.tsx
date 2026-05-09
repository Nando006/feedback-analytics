import { Link, useNavigation, useRouteLoaderData } from "react-router-dom";
import type {
  Enterprise,
} from "lib/interfaces/entities/enterprise.entity";
import type { AuthUser } from "lib/interfaces/entities/auth-user.entity";
import Header from "components/user/shared/header";
import Information from "components/user/pages/profile/editUser/information";
import CardSimple from "components/user/shared/cards/cardSimple";
import FormCollectingDataEnterprise from "components/user/pages/profile/editCollectingData/formCollectingDataEnterprise";
import QuestionDinamicEnterprise from "components/user/pages/profile/questionsDinamic/questionDinamicEnterprise";

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
    navigation.formAction?.includes("/user/edit/profile");

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
          type="default"
          title="QR Code da Empresa"
          description="Acesse, baixe e compartilhe o QR Code geral da sua empresa para receber feedbacks dos seus clientes de forma rápida e fácil."
        >
          <div className="mt-4 flex">
            <Link
              to="/user/qrcode/enterprise"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--primary-color) px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-(--primary-color)/90"
            >
              Acessar QR Code da Empresa
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </CardSimple>
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

      <CardSimple
        type="accordion"
        title="Deseja Definir Perguntas Objetivas para seus Clientes ?"
        description="Essas perguntas serão apresentadas para seus clientes no momento que estiver dando o feedback pelo QRCode. As perguntas sempre serão respondidas com as seguintes opções: 'Péssimo', 'Ruim', 'Mediana', 'Boa', 'Ótima'."
      >
        <QuestionDinamicEnterprise />
      </CardSimple>
    </div>
  );
}
