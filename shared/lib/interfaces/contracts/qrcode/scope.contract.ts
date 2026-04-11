/**
 * Tipos base de escopo e item de catalogo do dominio QR Code.
 * Servem para padronizar os contratos publicos de perguntas e contexto visual.
 */
export type QrcodeCatalogItemKind = 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';

export type QrcodeScopeType = 'COMPANY' | QrcodeCatalogItemKind;
