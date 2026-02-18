# Padrão de Interfaces

Este diretório contém apenas contratos de tipagem compartilhados no projeto.

## Estrutura

- `entities/`
  - Entidades centrais do sistema (usuário autenticado, empresa, composições entre entidades).
  - Ex.: `auth-user.entity.ts`, `enterprise.entity.ts`, `enterprise-and-user.entity.ts`

- `contracts/`
  - Contratos de entrada/saída reutilizáveis entre frontend e backend (payloads e responses).
  - Ex.: `qrcode.contract.ts`, `enterprise.contract.ts`, `action-data.contract.ts`

- `domain/`
  - Tipos de domínio reutilizáveis entre services, loaders, pages e components.
  - Ex.: `feedback.domain.ts`

## Convenção de nomes

- `*.entity.ts`: entidade do núcleo do sistema.
- `*.contract.ts`: contrato de request/response de integração.
- `*.domain.ts`: tipos de domínio compartilhados.

## Regra de uso

- Tipos de apresentação (props de componente/página) **não** ficam aqui.
- Tipos de apresentação devem ficar próximos do uso, em arquivos `ui.types.ts` dentro de `components/` ou `pages/`.
