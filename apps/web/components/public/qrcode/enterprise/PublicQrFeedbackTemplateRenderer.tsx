import FormQRCodeFeedback from 'components/public/forms/formQRCodeFeedback';
import {
  resolvePublicQrFeedbackTemplate,
} from 'src/lib/utils/publicQrFeedbackTemplateEngine';
import type {
  FeedbackTemplateRegistry,
  PublicQrFeedbackTemplateRendererProps,
} from './ui.types';

const TEMPLATE_COMPONENTS: FeedbackTemplateRegistry = {
  BASE_DYNAMIC_FORM: FormQRCodeFeedback,
};

export default function PublicQrFeedbackTemplateRenderer({
  scope,
  model,
}: PublicQrFeedbackTemplateRendererProps) {
  const templateKey = resolvePublicQrFeedbackTemplate(scope);
  const Template = TEMPLATE_COMPONENTS[templateKey] ?? FormQRCodeFeedback;

  return <Template model={model} />;
}
