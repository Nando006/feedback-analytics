import type { ReactNode } from 'react';

/**
 * Propriedades do card de login.
 * Aparece no hover ao passar o mouse sobre `PropsCardLogin` após importar.
 * Ícone exibido no topo do card (opcional).
 * Título principal do card.
 * Texto auxiliar/descrição curta do card.
 * Componente de formulário renderizado dentro do card (ex.: <FormLogin />).
 * URL do link para a página de cadastro (opcional). Se a tela for login.
 * URL do link para a página de login (opcional)
 */
export interface PropsCardForm {
  icon?: ReactNode;
  title: string;
  text: string;
  form: ReactNode;
  linkRegister?: string;
  linkLogin?: string;
}
