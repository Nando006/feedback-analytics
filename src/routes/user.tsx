import ErrorPage from 'components/user/handling/errorPage';
import Dashboard from 'pages/user/dashboard';
import Customer from 'pages/user/edit/customer';
import User from 'pages/user/edit/user';
import FeedbacksAll from 'pages/user/feedbacks/feedbacksAll';
import Feedbacks from 'pages/user/feedbacks/feedbacks';
import QRCode from 'pages/user/qrcode';
import FeedbacksInsightsReport from 'pages/user/feedbacks/insights/feedbackInsightsReport';
import LayoutUser from 'layouts/user';
import { Route } from 'react-router-dom';
import { LoaderUserProtected } from 'lib/loaders/loaderUserProtected';
import Profile from 'pages/user/profile';
import FeedbacksInsightsEmotional from 'pages/user/feedbacks/insights/feedbacksInsightsEmotional';
import FeedbacksInsightsStatistics from 'pages/user/feedbacks/insights/feedbacksInsightsStatistics';
import FeedbacksAnalyticsPositive from 'pages/user/feedbacks/analytics/feedbacksAnalyticsPositive';
import FeedbacksAnalyticsNegative from 'pages/user/feedbacks/analytics/feedbacks.AnalyticsNegative';
import FeedbacksAnalyticsAll from 'pages/user/feedbacks/analytics/feedbacksAnalyticsAll';

export function RouteUser() {
  return (
    <Route
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
      />
      <Route
        path="qrcode"
        element={<QRCode />}
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
        path="edit/customer"
        element={<Customer />}
      />
      <Route
        path="edit/user"
        element={<User />}
      />
    </Route>
  );
}
