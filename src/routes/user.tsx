import ErrorPage from 'components/user/shared/handling/errorPage';
import Dashboard from 'pages/user/dashboard';
import EditCustomer from 'pages/user/edit/editCustomers';
import EditUser from 'pages/user/edit/editProfile';
import FeedbacksAll from 'pages/user/feedbacks/feedbacksAll';
import Feedbacks from 'pages/user/feedbacks/feedbacks';
import QRCodeEnterprise from 'pages/user/qrcodes/qrcodeEnterprise';
import FeedbacksInsightsReport from 'pages/user/feedbacks/insights/feedbackInsightsReport';
import LayoutUser from 'layouts/user';
import { Route } from 'react-router-dom';
import { LoaderUserProtected } from 'src/routes/loaders/loaderUserProtected';
import { LoaderUserDashboard } from 'src/routes/loaders/loaderUserDashboard';
import { LoaderFeedbacksAll } from 'src/routes/loaders/loaderFeedbacksAll';
import { LoaderFeedbacksAnalyticsAll } from 'src/routes/loaders/loaderFeedbacksAnalyticsAll';
import { LoaderFeedbacksAnalyticsPositive } from 'src/routes/loaders/loaderFeedbacksAnalyticsPositive';
import { LoaderFeedbacksAnalyticsNegative } from 'src/routes/loaders/loaderFeedbacksAnalyticsNegative';
import { LoaderFeedbacksInsightsStatistics } from 'src/routes/loaders/loaderFeedbacksInsightsStatistics';
import { LoaderFeedbacksInsightsEmotional } from './loaders/loaderFeedbacksInsightsEmotional';
import { LoaderFeedbacksInsightsReport } from './loaders/loaderFeedbacksInsightsReport';
import { LoaderQrCodeEnterprise } from './loaders/loaderQrCodeEnterprise';
import Profile from 'pages/user/profile';
import FeedbacksInsightsEmotional from 'pages/user/feedbacks/insights/feedbacksInsightsEmotional';
import FeedbacksInsightsStatistics from 'pages/user/feedbacks/insights/feedbacksInsightsStatistics';
import FeedbacksAnalyticsPositive from 'pages/user/feedbacks/analytics/feedbacksAnalyticsPositive';
import FeedbacksAnalyticsNegative from 'pages/user/feedbacks/analytics/feedbacksAnalyticsNegative';
import FeedbacksAnalyticsAll from 'pages/user/feedbacks/analytics/feedbacksAnalyticsAll';
import QRCodeProducts from 'pages/user/qrcodes/qrcodeProducts';
import { ActionCollectingData } from './actions/actionCollectingData';
import { ActionFeedbackInsightsReport } from './actions/actionFeedbackInsightsReport';
import EditCollectingData from 'pages/user/edit/editCollectingData';
import { ActionProfile } from './actions/actionProfile';
import { ActionQrCodeEnterprise } from './actions/actionQrCodeEnterprise';
import { ActionLogout } from './actions/actionLogout';

export function RouteUser() {
  return (
    <Route
      id="user"
      path="/user"
      errorElement={<ErrorPage />}
      element={<LayoutUser />}
      loader={LoaderUserProtected}
      action={ActionLogout}>
      <Route
        path="dashboard"
        loader={LoaderUserDashboard}
        element={<Dashboard />}
      />
      <Route
        path="profile"
        element={<Profile />}
      />
      <Route
        path="qrcode/enterprise"
        loader={LoaderQrCodeEnterprise}
        action={ActionQrCodeEnterprise}
        element={<QRCodeEnterprise />}
      />
      <Route
        path="qrcode/products"
        element={<QRCodeProducts />}
      />
      <Route
        path="feedbacks/all"
        loader={LoaderFeedbacksAll}
        element={<FeedbacksAll />}
      />
      <Route
        path="feedbacks/:id"
        element={<Feedbacks />}
      />
      <Route
        path="feedbacks/analytics/all"
        loader={LoaderFeedbacksAnalyticsAll}
        element={<FeedbacksAnalyticsAll />}
      />
      <Route
        path="feedbacks/analytics/positive"
        loader={LoaderFeedbacksAnalyticsPositive}
        element={<FeedbacksAnalyticsPositive />}
      />
      <Route
        path="feedbacks/analytics/negative"
        loader={LoaderFeedbacksAnalyticsNegative}
        element={<FeedbacksAnalyticsNegative />}
      />
      <Route
        path="insights/reports"
        loader={LoaderFeedbacksInsightsReport}
        action={ActionFeedbackInsightsReport}
        element={<FeedbacksInsightsReport />}
      />
      <Route
        path="insights/emotional"
        loader={LoaderFeedbacksInsightsEmotional}
        element={<FeedbacksInsightsEmotional />}
      />
      <Route
        path="insights/statistics"
        loader={LoaderFeedbacksInsightsStatistics}
        element={<FeedbacksInsightsStatistics />}
      />
      <Route
        path="edit/customers"
        element={<EditCustomer />}
      />
      <Route
        path="edit/profile"
        element={<EditUser />}
        action={ActionProfile}
      />
      <Route
        path="edit/collecting-data-enterprise"
        element={<EditCollectingData />}
        action={ActionCollectingData}
      />
    </Route>
  );
}
