# Banco de Dados — Visão Geral e Arquitetura

> Documentação técnica do schema PostgreSQL hospedado no Supabase. Cobre todas as tabelas, relacionamentos, políticas de segurança (RLS), funções, triggers e índices do sistema.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Tecnologia e Infraestrutura](#tecnologia-e-infraestrutura)
3. [Diagrama de Entidades (ERD)](#diagrama-de-entidades-erd)
4. [Domínios e Grupos de Tabelas](#domínios-e-grupos-de-tabelas)
5. [Referência de Tabelas](#referência-de-tabelas)
6. [Funções e Stored Procedures](#funções-e-stored-procedures)
7. [Triggers](#triggers)
8. [Segurança e RLS](#segurança-e-rls)
9. [Índices e Performance](#índices-e-performance)
10. [Regras de Integridade e Constraints](#regras-de-integridade-e-constraints)
11. [Storage](#storage)

---

## Visão Geral

O banco de dados é a camada de persistência central da plataforma. Toda a lógica de isolamento multi-tenant, autorização, anti-spam e integridade referencial é aplicada diretamente no banco — não apenas na camada de aplicação — garantindo segurança em profundidade.

**Princípios arquiteturais:**

- **Multi-tenancy por RLS:** cada linha de dados está vinculada a um `enterprise_id`; o PostgreSQL aplica Row Level Security automaticamente em todas as queries, tornando impossível o vazamento entre empresas.
- **Fonte única de verdade para segurança:** as políticas RLS são a última barreira de defesa — mesmo se o API Gateway for comprometido, o banco recusa acessos indevidos.
- **Integridade por cascata:** deleções propagam-se via `ON DELETE CASCADE` para manter consistência sem operações manuais.
- **Imutabilidade de mídias:** arquivos de Storage são protegidos contra exclusão por trigger, garantindo rastreabilidade histórica.
- **Onboarding automático:** ao criar conta, um trigger semeia automaticamente as 3 perguntas institucionais padrão para a empresa.

---

## Tecnologia e Infraestrutura

| Item | Detalhe |
|---|---|
| **Banco** | PostgreSQL (gerenciado pelo Supabase) |
| **Autenticação** | Supabase Auth (`auth.users`) — JWT com claims customizados |
| **Segurança** | Row Level Security (RLS) habilitado em todas as tabelas públicas |
| **Storage** | Supabase Storage (buckets com triggers de proteção) |
| **Schema principal** | `public` |
| **Schema de autenticação** | `auth` (gerenciado pelo Supabase) |
| **Extensões usadas** | `gen_random_uuid()`, `pg_advisory_xact_lock()`, `md5()` |

---

## Diagrama de Entidades (ERD)

```
auth.users (Supabase Auth)
    │
    │ 1:1 (trigger on_auth_user_created)
    ▼
enterprise ──────────────────────────────────────────────────────────────┐
    │                                                                     │
    ├──── 1:1 ──→ collecting_data_enterprise                             │
    │                                                                     │
    ├──── 1:N ──→ catalog_items                                          │
    │                   │                                                 │
    │                   └──── 1:N ──→ collection_points ←────────────────┤
    │                   │                                                 │
    │                   └──── 1:N ──→ questions_of_feedbacks ←───────────┤
    │                                         │                           │
    │                                         └──── 1:N ──→ feedback_question_subquestions
    │                                                                     │
    ├──── 1:N ──→ collection_points (corporativo, sem catalog_item)      │
    │                                                                     │
    ├──── 1:N ──→ questions_of_feedbacks (escopo COMPANY)               │
    │                                                                     │
    ├──── 1:N ──→ tracked_devices                                        │
    │                   │                                                 │
    │                   └──── N:1 ──→ customer                          │
    │                                                                     │
    ├──── 1:N ──→ feedback ───────────────────────────────────────────────┘
    │                 │
    │                 ├──── 1:N ──→ feedback_question_answers
    │                 │                   └──── N:1 ──→ questions_of_feedbacks
    │                 │
    │                 ├──── 1:N ──→ feedback_subquestion_answers
    │                 │                   └──── N:1 ──→ feedback_question_subquestions
    │                 │
    │                 └──── 1:1 ──→ feedback_analysis (IA)
    │
    └──── 1:N ──→ feedback_insights_report (por escopo/item)
```

---

## Domínios e Grupos de Tabelas

| Domínio | Tabelas | Responsabilidade |
|---|---|---|
| **Identidade** | `auth.users`, `enterprise` | Autenticação e raiz de autorização multi-tenant |
| **Contexto Analítico** | `collecting_data_enterprise` | Dados estratégicos injetados nos prompts de IA |
| **Catálogo** | `catalog_items`, `collection_points` | Produtos/Serviços/Departamentos e QR Codes |
| **Formulário** | `questions_of_feedbacks`, `feedback_question_subquestions` | Perguntas dinâmicas exibidas no formulário público |
| **Coleta** | `feedback`, `feedback_question_answers`, `feedback_subquestion_answers` | Dados brutos dos clientes finais |
| **Anti-spam** | `tracked_devices`, `customer` | Rastreio de dispositivos e identificação opcional de clientes |
| **Inteligência Artificial** | `feedback_analysis`, `feedback_insights_report` | Resultados e relatórios do motor de IA |

---

## Referência de Tabelas

### `auth.users`

> Schema gerenciado pelo Supabase. Tabela central de autenticação.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | Identificador único do usuário |
| `email` | varchar | E-mail de login |
| `encrypted_password` | varchar | Senha hasheada |
| `raw_user_meta_data` | jsonb | Metadados temporários — higienizados por trigger |
| `phone` | text | Telefone validado após signup |
| `email_confirmed_at` | timestamptz | Data de confirmação do e-mail |
| `is_anonymous` | boolean | Indica usuário anônimo |

**Triggers:** `on_auth_user_created` → `create_enterprise_on_signup()` | `on_auth_user_metadata_before_update` → `clean_user_metadata_before_change()`

---

### `public.enterprise`

> Cadastro da empresa vinculada ao usuário autenticado. **Entidade raiz de todo o isolamento multi-tenant.**

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid PK | Sim | Identificador único — referenciado por todas as tabelas |
| `auth_user_id` | uuid | Sim | FK para `auth.users.id` — vínculo 1:1 |
| `document` | text | Sim | CPF ou CNPJ validado (Módulo 11) |
| `account_type` | text | Não | Tipo de conta (`PF` / `PJ`) |
| `terms_version` | text | Não | Versão dos termos aceitos |
| `terms_accepted_at` | timestamptz | Não | Data de aceite dos termos |
| `created_at` | timestamptz | Auto | — |
| `updated_at` | timestamptz | Auto | Atualizado por trigger |

**Restrições:** `document` único por empresa; `auth_user_id` único (ON CONFLICT DO NOTHING).

---

### `public.collecting_data_enterprise`

> Dados estratégicos da empresa usados para contextualizar os prompts enviados à IA.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid PK | Sim | — |
| `enterprise_id` | uuid FK | Sim | → `enterprise.id` |
| `company_objective` | text | Não | Objetivo macro do negócio |
| `analytics_goal` | text | Não | Meta de análise de feedbacks |
| `business_summary` | text | Não | Resumo livre do negócio |
| `main_products_or_services` | text[] | Não | Lista dos principais produtos/serviços |
| `uses_company_products` | boolean | Sim | Habilita uso de produtos no formulário |
| `uses_company_services` | boolean | Sim | Habilita uso de serviços no formulário |
| `uses_company_departments` | boolean | Sim | Habilita uso de departamentos no formulário |

---

### `public.catalog_items`

> Catálogo de itens da empresa (produtos, serviços, departamentos) — base para segmentação de QR Codes e feedback.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid PK | Sim | — |
| `enterprise_id` | uuid FK | Sim | → `enterprise.id` ON DELETE CASCADE |
| `kind` | text | Sim | `PRODUCT` \| `SERVICE` \| `DEPARTMENT` |
| `name` | text | Sim | Nome exibido no formulário e dashboard |
| `description` | text | Não | Descrição opcional |
| `status` | text | Sim | `ACTIVE` (default) \| `INACTIVE` |
| `sort_order` | integer | Sim | Ordenação exibição (default 0) |

**Índices:** `(enterprise_id, kind)`, `(status)`

---

### `public.collection_points`

> Pontos de coleta de feedback — representam cada QR Code físico ou digital gerado.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid PK | Sim | — |
| `enterprise_id` | uuid FK | Sim | → `enterprise.id` ON DELETE CASCADE |
| `catalog_item_id` | uuid FK | Não | → `catalog_items.id` ON DELETE SET NULL — `null` = ponto corporativo |
| `name` | text | Sim | Nome do ponto de coleta |
| `type` | text | Sim | `QR_CODE` (único tipo atual) |
| `identifier` | text | Não | Identificador externo/slug |
| `status` | text | Sim | `ACTIVE` (default) \| `INACTIVE` |

**Regra de negócio:** o formulário público só fica acessível se o ponto está `ACTIVE` **e**, quando vinculado a item de catálogo, o item também está `ACTIVE` (verificado pela policy RLS anon).

---

### `public.questions_of_feedbacks`

> Perguntas dinâmicas exibidas no formulário público. Cada empresa tem até 3 perguntas por escopo (empresa ou item de catálogo).

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid PK | Sim | — |
| `enterprise_id` | uuid FK | Sim | → `enterprise.id` ON DELETE CASCADE |
| `scope_type` | text | Sim | `COMPANY` \| `PRODUCT` \| `SERVICE` \| `DEPARTMENT` |
| `catalog_item_id` | uuid FK | Condicional | → `catalog_items.id` — obrigatório quando `scope_type ≠ COMPANY` |
| `question_order` | integer | Sim | Posição da pergunta: `1`, `2` ou `3` |
| `question_text` | text | Sim | Texto da pergunta (20–150 caracteres) |
| `is_active` | boolean | Sim | Controla exibição no formulário (default `true`) |

**Perguntas padrão** (semeadas automaticamente no signup):
1. "Como foi sua experiência em relação ao atendimento?"
2. "O que você achou da qualidade do produto/serviço?"
3. "Como você avalia a relação entre o valor pago e a qualidade do produto/serviço?"

**Constraints:** unicidade por `(enterprise_id, question_order)` para escopo `COMPANY`; por `(enterprise_id, scope_type, catalog_item_id, question_order)` para itens.

---

### `public.feedback_question_subquestions`

> Subperguntas opcionais vinculadas a cada pergunta principal — ativadas individualmente pelo gestor.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid PK | Sim | — |
| `question_id` | uuid FK | Sim | → `questions_of_feedbacks.id` ON DELETE CASCADE |
| `subquestion_order` | integer | Sim | Posição: `1`, `2` ou `3` |
| `subquestion_text` | text | Sim | Texto da subpergunta (20–150 caracteres) |
| `is_active` | boolean | Sim | `false` por padrão — ativação explícita pelo gestor |

**Constraint:** `(question_id, subquestion_order)` único.

---

### `public.customer`

> Cadastro opcional do cliente final que se identificou ao enviar feedback.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid PK | Sim | — |
| `enterprise_id` | uuid FK | Sim | → `enterprise.id` |
| `name` | text | Não | Nome informado pelo cliente |
| `email` | text | Não | E-mail informado |
| `gender` | text | Não | Gênero informado |

---

### `public.tracked_devices`

> Dispositivos rastreados por fingerprint para aplicar a regra anti-spam (1 feedback/dia por ponto de coleta).

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid PK | Sim | — |
| `enterprise_id` | uuid FK | Sim | → `enterprise.id` ON DELETE CASCADE |
| `customer_id` | uuid FK | Não | → `customer.id` — associado quando cliente se identifica |
| `device_fingerprint` | text | Sim | Hash MD5 diário `(user_agent \| ip \| dia)` |
| `user_agent` | text | Não | User-Agent do navegador |
| `ip_address` | inet | Não | IP do cliente |
| `is_blocked` | boolean | Não | Bloqueio manual pelo gestor (default `false`) |
| `blocked_reason` | text | Não | Motivo do bloqueio |
| `blocked_at` | timestamptz | Não | Data do bloqueio |
| `blocked_by` | uuid | Não | ID do gestor que bloqueou |
| `feedback_count` | integer | Sim | Contador total de feedbacks (default 0) |
| `last_feedback_at` | timestamptz | Não | Data/hora do último envio |

---

### `public.feedback`

> Feedback bruto recebido do cliente via formulário público.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid PK | Sim | — |
| `enterprise_id` | uuid FK | Sim | → `enterprise.id` ON DELETE CASCADE |
| `collection_point_id` | uuid FK | Sim | → `collection_points.id` — QR Code de origem |
| `tracked_device_id` | uuid FK | Não | → `tracked_devices.id` — dispositivo emissor |
| `message` | text | Sim | Texto livre do cliente |
| `rating` | integer | Não | Nota global da experiência (1–5) |

**RLS de inserção anônima** valida: ponto ativo, empresa correspondente, tipo QR_CODE, dispositivo não bloqueado.

---

### `public.feedback_question_answers`

> Respostas às perguntas dinâmicas para cada feedback enviado. Inclui snapshot do texto da pergunta para preservar histórico.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid PK | Sim | — |
| `feedback_id` | uuid FK | Sim | → `feedback.id` ON DELETE CASCADE |
| `question_id` | uuid FK | Sim | → `questions_of_feedbacks.id` ON DELETE CASCADE |
| `question_text_snapshot` | text | Sim | Texto da pergunta no momento do envio (imutável) |
| `answer_value` | text | Sim | `PESSIMO` \| `RUIM` \| `MEDIANA` \| `BOA` \| `OTIMA` |
| `answer_score` | integer | Sim | Valor numérico correspondente (1–5) |

**Constraint:** `(feedback_id, question_id)` único — 1 resposta por pergunta por feedback.

---

### `public.feedback_subquestion_answers`

> Respostas às subperguntas para cada feedback. Mesma lógica de snapshot das respostas principais.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid PK | Sim | — |
| `feedback_id` | uuid FK | Sim | → `feedback.id` ON DELETE CASCADE |
| `subquestion_id` | uuid FK | Sim | → `feedback_question_subquestions.id` ON DELETE CASCADE |
| `subquestion_text_snapshot` | text | Sim | Texto da subpergunta no momento do envio |
| `answer_value` | text | Sim | `PESSIMO` \| `RUIM` \| `MEDIANA` \| `BOA` \| `OTIMA` |
| `answer_score` | integer | Sim | Valor numérico (1–5) |

**Constraint:** `(feedback_id, subquestion_id)` único.

---

### `public.feedback_analysis`

> Resultado da análise de sentimento e extração semântica gerada pelo motor de IA para cada feedback.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid PK | Sim | — |
| `feedback_id` | uuid FK | Sim | → `feedback.id` ON DELETE CASCADE |
| `sentiment` | text | Não | `Positivo` \| `Neutro` \| `Negativo` |
| `categories` | text[] | Não | Categorias semânticas extraídas pela IA |
| `keywords` | text[] | Não | Palavras-chave extraídas (com filtro anti-poluição) |

---

### `public.feedback_insights_report`

> Relatório consolidado de insights por empresa e por escopo (empresa, produto, serviço ou departamento). Upsert — há exatamente **1 registro por contexto**.

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid PK | Sim | — |
| `enterprise_id` | uuid FK | Sim | → `enterprise.id` ON DELETE CASCADE |
| `scope_type` | text | Sim | `COMPANY` \| `PRODUCT` \| `SERVICE` \| `DEPARTMENT` |
| `catalog_item_id` | uuid FK | Condicional | → `catalog_items.id` ON DELETE CASCADE — obrigatório quando `scope_type ≠ COMPANY` |
| `catalog_item_name` | text | Não | Nome do item no momento do relatório |
| `summary` | text | Não | Resumo situacional gerado pela IA |
| `recommendations` | text[] | Não | Lista de recomendações acionáveis |

**Índice único:** `(enterprise_id, scope_type, catalog_item_id) NULLS NOT DISTINCT` — garante um relatório por contexto, sobrescrito a cada análise.

---

## Funções e Stored Procedures

| Função | Schema | Tipo | Descrição |
|---|---|---|---|
| `create_enterprise_on_signup()` | public | Trigger (AFTER INSERT em `auth.users`) | Cria `enterprise`, valida documento/telefone únicos, semeia as 3 perguntas padrão e higieniza metadados do JWT |
| `clean_user_metadata_before_change()` | public | Trigger (BEFORE UPDATE em `auth.users`) | Remove chaves sensíveis (`document`, `phone`, `account_type`, etc.) do `raw_user_meta_data` antes de qualquer update (LGPD) |
| `generate_device_fingerprint(user_agent, ip)` | public | Utilitária | Retorna `md5(user_agent \| ip \| dia_epoch)` — fingerprint diário rotativo |
| `can_device_send_feedback(enterprise_id, fingerprint, collection_point_id?)` | public | Query | Retorna `boolean` — verifica se o dispositivo já enviou feedback no dia para o ponto informado (com fallback legado por empresa) |
| `register_device_feedback(enterprise_id, fingerprint, user_agent, ip, customer_id?, collection_point_id?)` | public | Mutação | Upsert em `tracked_devices` com `pg_advisory_xact_lock` para serializar acessos concorrentes; incrementa `feedback_count` |
| `jwt_custom_claims()` | public | Utilitária | Injeta `role: 'enterprise'` e `enterprise_id` no payload JWT — usado pelo Supabase para claims customizados |
| `enterprise_public_documents_fn()` | public | Query | Retorna documentos distintos cadastrados — usada em validações públicas de duplicidade |
| `document_exists(document)` | public | Query | Verifica se CPF/CNPJ já existe na base |
| `phone_exists(phone)` | public | Query | Verifica se telefone já existe em `auth.users` |
| `enterprise_public_ids_fn()` | public | Query | Retorna IDs públicos de empresas ativas |
| `update_updated_at_column()` | public | Trigger genérico | Atualiza `updated_at = now()` em qualquer tabela antes de UPDATE |
| `validate_questions_of_feedbacks_context()` | public | Trigger | Valida coerência entre `scope_type` e `catalog_item_id` em `questions_of_feedbacks` |
| `validate_feedback_insights_report_context()` | public | Trigger | Mesma validação de coerência em `feedback_insights_report` |

---

## Triggers

| Trigger | Tabela | Evento | Função | Propósito |
|---|---|---|---|---|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | `create_enterprise_on_signup()` | Onboarding automático — cria empresa e perguntas padrão |
| `on_auth_user_metadata_before_update` | `auth.users` | BEFORE UPDATE | `clean_user_metadata_before_change()` | Sanitização LGPD do JWT |
| `validate_questions_of_feedbacks_context` | `questions_of_feedbacks` | BEFORE INSERT/UPDATE | `validate_questions_of_feedbacks_context()` | Integridade de escopo das perguntas |
| `validate_feedback_insights_report_context` | `feedback_insights_report` | BEFORE INSERT/UPDATE | `validate_feedback_insights_report_context()` | Integridade de escopo dos relatórios |
| `set_updated_at` | todas (exceto `feedback_question_answers`) | BEFORE UPDATE | `update_updated_at_column()` | Auditoria automática de timestamps |
| `enforce_bucket_name_length_trigger` | `storage.buckets` | BEFORE INSERT/UPDATE | `storage.enforce_bucket_name_length()` | Valida tamanho do nome do bucket |
| `protect_buckets_delete` | `storage.buckets` | BEFORE DELETE | `storage.protect_delete()` | Bloqueia exclusão de buckets (RNE-012) |
| `protect_objects_delete` | `storage.objects` | BEFORE DELETE | `storage.protect_delete()` | Bloqueia exclusão de mídias (RNE-012) |
| `update_objects_updated_at` | `storage.objects` | BEFORE UPDATE | `storage.update_updated_at_column()` | Timestamp de Storage |

---

## Segurança e RLS

### Modelo de autorização

O sistema usa **duas camadas de autorização**:

1. **API Gateway:** valida JWT, extrai `enterprise_id` dos claims e injeta nas queries.
2. **RLS no PostgreSQL:** cada tabela possui policies que verificam `auth.uid()` e `enterprise_id` independentemente, sendo a barreira final.

### Perfis de acesso

| Perfil | Descrição | Tabelas com acesso |
|---|---|---|
| `anon` | Cliente final sem login (formulário público) | `collection_points` (SELECT ativo), `catalog_items` (SELECT ativo), `questions_of_feedbacks` (SELECT ativo), `feedback_question_subquestions` (SELECT ativo), `tracked_devices` (SELECT/INSERT/UPDATE próprio), `feedback` (INSERT), `feedback_question_answers` (INSERT), `feedback_subquestion_answers` (INSERT) |
| `authenticated` | Gestor logado com JWT válido | Todas as tabelas `public.*` via `enterprise_id` do JWT |

### Claims JWT customizados

A função `jwt_custom_claims()` injeta no token:
```json
{
  "role": "enterprise",
  "enterprise_id": "<uuid da empresa do usuário>"
}
```
Isso permite que as policies RLS referenciem `enterprise_id` diretamente do token sem subconsultas adicionais.

### Higienização LGPD

Ao criar ou atualizar usuários, os triggers removem automaticamente do `raw_user_meta_data` os campos sensíveis: `document`, `phone`, `company_name`, `account_type`, `terms_version`, `terms_accepted_at`. Esses dados vivem **apenas** em `public.enterprise` com RLS, nunca no payload JWT.

---

## Índices e Performance

| Tabela | Índice | Colunas | Propósito |
|---|---|---|---|
| `catalog_items` | `idx_catalog_items_enterprise_kind` | `(enterprise_id, kind)` | Filtro por tipo de item da empresa |
| `catalog_items` | `idx_catalog_items_status` | `(status)` | Filtro rápido de itens ativos |
| `collection_points` | `idx_collection_points_catalog_item_id` | `(catalog_item_id)` | JOIN com catálogo |
| `questions_of_feedbacks` | `uq_questions_company_order` | `(enterprise_id, question_order)` WHERE COMPANY | Unicidade das perguntas corporativas |
| `questions_of_feedbacks` | `uq_questions_item_order` | `(enterprise_id, scope_type, catalog_item_id, question_order)` | Unicidade das perguntas por item |
| `questions_of_feedbacks` | `idx_questions_context` | `(enterprise_id, scope_type, catalog_item_id, is_active)` | Busca do formulário público |
| `feedback_question_answers` | `idx_feedback_question_answers_feedback_id` | `(feedback_id)` | JOIN no carregamento de respostas |
| `feedback_question_answers` | `idx_feedback_question_answers_question_id` | `(question_id)` | Análise por pergunta |
| `feedback_subquestion_answers` | `idx_feedback_subquestion_answers_feedback_id` | `(feedback_id)` | JOIN no carregamento |
| `feedback_subquestion_answers` | `idx_feedback_subquestion_answers_subquestion_id` | `(subquestion_id)` | Análise por subpergunta |
| `feedback_question_subquestions` | `idx_feedback_question_subquestions_active` | `(question_id, is_active, subquestion_order)` | Carregamento ordenado de subperguntas ativas |
| `feedback_insights_report` | `uq_feedback_insights_context` | `(enterprise_id, scope_type, catalog_item_id)` NULLS NOT DISTINCT | Upsert idempotente do relatório |
| `feedback_insights_report` | `idx_feedback_insights_report_enterprise_updated` | `(enterprise_id, updated_at DESC)` | Listagem dos relatórios mais recentes |

---

## Regras de Integridade e Constraints

| Tabela | Constraint | Regra |
|---|---|---|
| `catalog_items` | `catalog_items_kind_check` | `kind` ∈ `{PRODUCT, SERVICE, DEPARTMENT}` |
| `catalog_items` | `catalog_items_status_check` | `status` ∈ `{ACTIVE, INACTIVE}` |
| `questions_of_feedbacks` | `questions_of_feedbacks_scope_type_check` | `scope_type` ∈ `{COMPANY, PRODUCT, SERVICE, DEPARTMENT}` |
| `questions_of_feedbacks` | `questions_of_feedbacks_question_order_check` | `question_order` entre 1 e 3 |
| `questions_of_feedbacks` | `questions_of_feedbacks_question_text_length_check` | texto da pergunta entre 20 e 150 caracteres |
| `feedback_question_subquestions` | `feedback_question_subquestions_order_check` | `subquestion_order` entre 1 e 3 |
| `feedback_question_subquestions` | `feedback_question_subquestions_text_length_check` | texto da subpergunta entre 20 e 150 caracteres |
| `feedback_question_answers` | `feedback_question_answers_answer_value_check` | `answer_value` ∈ `{PESSIMO, RUIM, MEDIANA, BOA, OTIMA}` |
| `feedback_question_answers` | `feedback_question_answers_answer_score_check` | `answer_score` entre 1 e 5 |
| `feedback_subquestion_answers` | `feedback_subquestion_answers_answer_value_check` | Mesmo enum de valores |
| `feedback_subquestion_answers` | `feedback_subquestion_answers_answer_score_check` | `answer_score` entre 1 e 5 |
| `feedback_insights_report` | `feedback_insights_report_scope_type_check` | `scope_type` ∈ `{COMPANY, PRODUCT, SERVICE, DEPARTMENT}` |

### Regras de cascata por deleção

| Tabela pai deletada | Tabelas afetadas | Comportamento |
|---|---|---|
| `enterprise` | `catalog_items`, `collection_points`, `questions_of_feedbacks`, `tracked_devices`, `feedback`, `feedback_insights_report`, `collecting_data_enterprise`, `customer` | `CASCADE` — dados da empresa são removidos |
| `catalog_items` | `collection_points`, `questions_of_feedbacks`, `feedback_insights_report` | `CASCADE` |
| `feedback` | `feedback_question_answers`, `feedback_subquestion_answers`, `feedback_analysis` | `CASCADE` |
| `questions_of_feedbacks` | `feedback_question_answers`, `feedback_question_subquestions` | `CASCADE` |
| `feedback_question_subquestions` | `feedback_subquestion_answers` | `CASCADE` |
| `catalog_items` → `collection_points` | `collection_points.catalog_item_id` | `SET NULL` — ponto vira corporativo ao perder o item |

---

## Storage

O Supabase Storage armazena logotipos e mídias das empresas. Três triggers de proteção estão ativos:

| Trigger | Tabela | Proteção |
|---|---|---|
| `protect_buckets_delete` | `storage.buckets` | Impede exclusão de buckets inteiros |
| `protect_objects_delete` | `storage.objects` | Impede exclusão de arquivos individuais |
| `enforce_bucket_name_length_trigger` | `storage.buckets` | Valida comprimento do nome do bucket em INSERT/UPDATE |

Arquivos só podem ser **substituídos** (novo upload sobrescreve) ou **mantidos** — nunca deletados. Isso garante rastreabilidade histórica de mídias (RNE-012).

---

## Veja Também

- [Arquitetura Geral do Sistema](../arquitetura.md)
- [Backend — Arquitetura Detalhada](../backend/arquitetura-estrutura.md)
- [Funcionalidades — Visão Geral](../funcionalidades/visao-geral.md)
- [Anti-spam e Fingerprint](../funcionalidades/anti-spam-fingerprint.md)
- [Higienização JWT / LGPD](../funcionalidades/higienizacao-jwt-lgpd.md)
- [SQL das Tabelas](../../database/sql/tables/)
- [SQL das Funções](../../database/sql/functions/)
- [SQL dos Triggers](../../database/sql/triggers/)
