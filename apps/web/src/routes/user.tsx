import ErrorPage from "components/user/shared/handling/errorPage";
import type { ShouldRevalidateFunctionArgs } from "react-router-dom";
import Dashboard from "pages/user/dashboard";
import FeedbacksAll from "pages/user/feedbacks/feedbacksAll";
import Feedbacks from "pages/user/feedbacks/feedbacks";
import QRCodeEnterprise from "pages/user/qrcodes/qrcodeEnterprise";
import LayoutUser from "layouts/user";
import { Route } from "react-router-dom";
import { LoaderUserProtected } from "src/routes/loaders/loaderUserProtected";
import { LoaderUserDashboard } from "src/routes/loaders/loaderUserDashboard";
import { LoaderFeedbacksAll } from "src/routes/loaders/loaderFeedbacksAll";
import { LoaderQrCodeEnterprise } from "./loaders/loaderQrCodeEnterprise";
import Profile from "pages/user/profile";
import InsightsHub from "pages/user/feedbacks/insights/insightsHub";
import { ActionFeedbackInsightsReport } from "./actions/actionFeedbackInsightsReport";
import FormHub from "pages/user/settings/formHub";
import CatalogHub from "pages/user/settings/catalogHub";
import { ActionProfile } from "./actions/actionProfile";
import { ActionQrCodeEnterprise } from "./actions/actionQrCodeEnterprise";
import { ActionLogout } from "./actions/actionLogout";
import { ActionSettingsForm } from "./actions/actionSettingsForm";
import { ActionFeedbackCatalogPage } from "./actions/actionFeedbackCatalogPage";
import SettingsLayout from "layouts/settings";

function shouldRevalidateUserRoute({
  formMethod,
  formAction,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  const isPost = String(formMethod ?? "").toUpperCase() === "POST";
  const actionPath = String(formAction ?? "");

  if (isPost && actionPath.includes("/user/qrcode/")) {
    return false;
  }

  return defaultShouldRevalidate;
}

export function RouteUser() {
  return (
    <Route
      id="user"
      path="/user"
      errorElement={<ErrorPage />}
      element={<LayoutUser />}
      loader={LoaderUserProtected}
      shouldRevalidate={shouldRevalidateUserRoute}
      action={ActionLogout}
    >
      <Route
        path="dashboard"
        loader={LoaderUserDashboard}
        element={<Dashboard />}
      />

      <Route
        path="feedbacks"
        loader={LoaderFeedbacksAll}
        element={<FeedbacksAll />}
      />
      <Route path="feedbacks/:id" element={<Feedbacks />} />

      <Route
        path="insights"
        action={ActionFeedbackInsightsReport}
        element={<InsightsHub />}
      />

      <Route path="settings" element={<SettingsLayout />}>
        <Route
          path="profile"
          element={<Profile />}
          action={ActionProfile}
        />
        <Route
          path="sharing"
          loader={LoaderQrCodeEnterprise}
          action={ActionQrCodeEnterprise}
          element={<QRCodeEnterprise />}
        />
        <Route
          path="form"
          element={<FormHub />}
          action={ActionSettingsForm}
        />
        <Route
          path="catalog"
          element={<CatalogHub />}
          action={ActionFeedbackCatalogPage}
        />
      </Route>
    </Route>
  );
}
