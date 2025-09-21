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
import Profile from 'pages/user/profile';
import FeedbacksInsightsEmotional from 'pages/user/feedbacks/insights/feedbacksInsightsEmotional';
import FeedbacksInsightsStatistics from 'pages/user/feedbacks/insights/feedbacksInsightsStatistics';
import FeedbacksAnalyticsPositive from 'pages/user/feedbacks/analytics/feedbacksAnalyticsPositive';
import FeedbacksAnalyticsNegative from 'pages/user/feedbacks/analytics/feedbacks.AnalyticsNegative';
import FeedbacksAnalyticsAll from 'pages/user/feedbacks/analytics/feedbacksAnalyticsAll';
import QRCodeProducts from 'pages/user/qrcodes/qrcodeProducts';
import { ActionCollectingData } from './actions/actionCollectingData';
import EditCollectingData from 'pages/user/edit/editCollectingData';
import { ActionProfile } from './actions/actionProfile';

export function RouteUser() {
  return (
    <Route
      id="user"
      path="/user"
      errorElement={<ErrorPage />}
      element={<LayoutUser />}
      loader={LoaderUserProtected}>
      <Route
        path="dashboard"
        element={<Dashboard />}
      />
      <Route
        path="profile"
        element={<Profile />}
        action={ActionProfile}
      />
      <Route
        path="qrcode/enterprise"
        element={<QRCodeEnterprise />}
      />
      <Route
        path="qrcode/products"
        element={<QRCodeProducts />}
      />
      <Route
        path="feedbacks/all"
        element={<FeedbacksAll />}
      />
      <Route
        path="feedbacks/:id"
        element={<Feedbacks />}
      />
      <Route
        path="feedbacks/analytics/all"
        element={<FeedbacksAnalyticsAll />}
      />
      <Route
        path="feedbacks/analytics/positive"
        element={<FeedbacksAnalyticsPositive />}
      />
      <Route
        path="feedbacks/analytics/negative"
        element={<FeedbacksAnalyticsNegative />}
      />
      <Route
        path="insights/reports"
        element={<FeedbacksInsightsReport />}
      />
      <Route
        path="insights/emotional"
        element={<FeedbacksInsightsEmotional />}
      />
      <Route
        path="insights/statistics"
        element={<FeedbacksInsightsStatistics />}
      />
      <Route
        path="edit/customers"
        element={<EditCustomer />}
      />
      <Route
        path="edit/profile"
        element={<EditUser />}
      />
      <Route
        path="edit/collecting-data-enterprise"
        element={<EditCollectingData />}
        action={ActionCollectingData}
      />
    </Route>
  );
}
