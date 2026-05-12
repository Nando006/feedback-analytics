# Funcionalidade — Catálogo de Feedback

## O Que É

O **Catálogo de Feedback** permite que a empresa organize a coleta por tipo de item — **Produtos**, **Serviços** e **Departamentos**. Cada tipo, quando ativado, recebe QR Codes exclusivos e pode ter perguntas customizadas por item.

## Por Que Existe

Sem o catálogo, todos os feedbacks caem em um "balde único" da empresa. Com ele, o gestor consegue comparar a satisfação entre produtos específicos, identificar qual departamento precisa de atenção e segmentar a análise de IA por contexto relevante.

## Como Configurar

1. Acesse **Ativar Tipos Premium** (`/user/edit/types-feedback`) e habilite os tipos que a empresa utiliza
2. Acesse **Configurar Catálogos** (`/user/edit/feedback-settings`) — apenas os tipos ativos aparecem
3. Selecione o catálogo desejado (Produtos, Serviços ou Departamentos)
4. Cadastre os itens com nome e descrição opcional
5. Se desejar, configure **perguntas customizadas** por item
6. Um QR Code é gerado automaticamente para cada item cadastrado

:::note
Desativar um tipo **não exclui** os itens cadastrados. Ao reativar, os itens voltam a aparecer normalmente.
:::

---

## Tipos de Catálogo

| Tipo | Flag no Banco | Rota de Gestão |
|---|---|---|
| **Produtos** | `uses_company_products` | `/user/edit/feedback-products` |
| **Serviços** | `uses_company_services` | `/user/edit/feedback-services` |
| **Departamentos** | `uses_company_departments` | `/user/edit/feedback-departments` |

---

## Estrutura de um Item de Catálogo

```typescript
interface CatalogItemInput {
  id?: string;                 // UUID — gerado pelo banco na criação
  name: string;                // Nome do produto, serviço ou departamento
  description?: string;        // Descrição opcional
  kind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';
  questions?: CompanyFeedbackQuestionInput[];
}
```

---

## Perguntas Dinâmicas por Item

Cada item pode ter perguntas customizadas com **subperguntas hierárquicas**. O componente `QuestionDinamicEnterprise` gerencia esse formulário.

- **Perguntas:** texto livre, entre 20 e 150 caracteres
- **Subperguntas:** resposta estruturada com escala `PESSIMO → OTIMA`
- A visibilidade das subperguntas depende da resposta selecionada na pergunta pai

---

## Breaking Change — Formulário Refatorado

:::warning Breaking Change (homolog → main)
O componente `formFeedbackSettings.tsx` foi **removido** e substituído por dois componentes independentes:

- **`formFeedbackCatalog.tsx`** — gerencia catálogos por tipo
- **`formTypesFeedback.tsx`** — gerencia quais tipos estão ativos

Qualquer submissão ao `actionFeedbackSettings.ts` agora **exige** o campo `intent` para determinar qual operação executar.
:::

### Intents Disponíveis

| Intent | Formulário | Ação |
|---|---|---|
| `save_company_feedback_questions` | `formFeedbackCatalog` | Salva perguntas gerais da empresa |
| `save_products_catalog` | `formFeedbackCatalog` | Salva catálogo de produtos |
| `save_services_catalog` | `formFeedbackCatalog` | Salva catálogo de serviços |
| `save_departments_catalog` | `formFeedbackCatalog` | Salva catálogo de departamentos |

---

## Referência Técnica

- [Endpoints de Enterprise / Collecting Data](../backend/endpoints.md)
- [Regras de Negócio — Catálogo](../backend/regras-negocio.md)
- [Componentes Frontend](../frontend/arquitetura-estrutura.md)
