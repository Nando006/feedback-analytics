/**
 * Props do formulário de atualização de e-mail.
 * Usado em: components/user/pages/profile/editUser/forms/formEmailUser.tsx.
 */
export type FormEmailUserProps = {
  defaultEmail?: string;
};

/**
 * Valores validados do formulário de e-mail.
 * Usado em: components/user/pages/profile/editUser/forms/formEmailUser.tsx.
 */
export type FormEmailUserValues = {
  email: string;
};

/**
 * Props do formulário de atualização de nome.
 * Usado em: components/user/pages/profile/editUser/forms/formNameUser.tsx.
 */
export type FormNameUserProps = {
  defaultFullName?: string;
};

/**
 * Props do formulário de início de verificação de telefone.
 * Usado em: components/user/pages/profile/editUser/forms/formPhoneStartUser.tsx.
 */
export type FormPhoneStartUserProps = {
  defaultPhone?: string;
  onSuccess?: () => void;
};

/**
 * Props do formulário de verificação de telefone.
 * Usado em: components/user/pages/profile/editUser/forms/formPhoneVerifyUser.tsx.
 */
export type FormPhoneVerifyUserProps = {
  onSuccess?: () => void;
};