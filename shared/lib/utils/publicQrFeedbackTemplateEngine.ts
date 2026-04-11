import type {
  FeedbackQuestionPublic,
  QrPublicContext,
} from 'lib/interfaces/contracts/qrcode.contract';

export type PublicQrFeedbackScope =
  | 'COMPANY'
  | 'PRODUCT'
  | 'SERVICE'
  | 'DEPARTMENT';

export type PublicQrFeedbackTemplateKey = 'BASE_DYNAMIC_FORM';

const SCOPE_BY_ITEM_KIND: Record<
  NonNullable<QrPublicContext['item_kind']>,
  PublicQrFeedbackScope
> = {
  PRODUCT: 'PRODUCT',
  SERVICE: 'SERVICE',
  DEPARTMENT: 'DEPARTMENT',
};

const TEMPLATE_BY_SCOPE: Record<
  PublicQrFeedbackScope,
  PublicQrFeedbackTemplateKey
> = {
  COMPANY: 'BASE_DYNAMIC_FORM',
  PRODUCT: 'BASE_DYNAMIC_FORM',
  SERVICE: 'BASE_DYNAMIC_FORM',
  DEPARTMENT: 'BASE_DYNAMIC_FORM',
};

function isValidScope(value: string): value is PublicQrFeedbackScope {
  return (
    value === 'COMPANY' ||
    value === 'PRODUCT' ||
    value === 'SERVICE' ||
    value === 'DEPARTMENT'
  );
}

export function resolvePublicQrFeedbackScopeFromItemKind(
  itemKind: QrPublicContext['item_kind'],
): PublicQrFeedbackScope {
  if (!itemKind) {
    return 'COMPANY';
  }

  return SCOPE_BY_ITEM_KIND[itemKind] ?? 'COMPANY';
}

export function resolvePublicQrFeedbackScope(params: {
  itemKind: QrPublicContext['item_kind'];
  questions: FeedbackQuestionPublic[];
}): PublicQrFeedbackScope {
  const { itemKind, questions } = params;

  const questionScopes = questions
    .map((question) => String(question.scope_type ?? '').trim())
    .filter(isValidScope);

  if (questionScopes.length === 0) {
    return resolvePublicQrFeedbackScopeFromItemKind(itemKind);
  }

  const uniqueScopes = new Set(questionScopes);

  if (uniqueScopes.size === 1) {
    return questionScopes[0] as PublicQrFeedbackScope;
  }

  const scopeFromItem = resolvePublicQrFeedbackScopeFromItemKind(itemKind);

  if (scopeFromItem !== 'COMPANY') {
    return scopeFromItem;
  }

  if (uniqueScopes.has('COMPANY')) {
    return 'COMPANY';
  }

  return questionScopes[0] as PublicQrFeedbackScope;
}

export function resolvePublicQrFeedbackTemplate(
  scope: PublicQrFeedbackScope,
): PublicQrFeedbackTemplateKey {
  return TEMPLATE_BY_SCOPE[scope] ?? 'BASE_DYNAMIC_FORM';
}
