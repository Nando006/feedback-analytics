import type {
  FormQRCodeFeedbackProps,
  PublicQrFeedbackFormViewModel,
} from 'components/public/forms/fields/fieldsQRCode/ui.types';
import type {
  PublicQrFeedbackScope,
  PublicQrFeedbackTemplateKey,
} from 'lib/utils/publicQrFeedbackTemplateEngine';

export type PublicQrFeedbackTemplateRendererProps = {
  scope: PublicQrFeedbackScope;
  model: PublicQrFeedbackFormViewModel;
};

export type FeedbackTemplateComponent = (
  props: FormQRCodeFeedbackProps,
) => React.JSX.Element;

export type FeedbackTemplateRegistry = Record<
  PublicQrFeedbackTemplateKey,
  FeedbackTemplateComponent
>;
