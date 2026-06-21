# Guia de Instalação

> Configure o ambiente completo do Feedback Analytics em menos de 15 minutos.

## Antes de Começar

Certifique-se de ter instalado:

| Ferramenta | Versão Mínima | Como verificar |
|---|---|---|
| **Node.js** | 20.x | `node -v` |
| **npm** | 10.x | `npm -v` |
| **Conta Supabase** | — | [supabase.com](https://supabase.com) |
| **Chave API Gemini** | — | [Google AI Studio](https://aistudio.google.com) |

---

## Passo 1 — Clone o Repositório

```bash
git clone https://github.com/seu-usuario/feedback-analytics.git
cd feedback-analytics
```

---

## Passo 2 — Instale as Dependências

O projeto é um monorepo. Instale as dependências em cada workspace separadamente:

```bash
npm install
cd apps/web && npm install && cd ../..
cd backends/api-gateway && npm install && cd ../..
cd services/ia-analyze && npm install && cd ../..
```

---

## Passo 3 — Configure as Variáveis de Ambiente

Crie um arquivo `.env` em cada serviço com as variáveis abaixo.

### `apps/web/.env`

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
VITE_API_BASE_URL=http://localhost:3000   # em produção/preview na Vercel pode ficar vazio (derivação por hostname)
```

### `backends/api-gateway/.env`

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
IA_ANALYZE_EXECUTION_MODE=local
IA_ANALYZE_REMOTE_TOKEN=um_token_secreto_compartilhado
IA_ANALYZE_REMOTE_URL=http://localhost:4100
PORT=3000
```

### `services/ia-analyze/.env`

```env
GEMINI_API_KEY=sua_chave_gemini_aqui
IA_ANALYZE_INTERNAL_TOKEN=um_token_secreto_compartilhado
PORT=4100
```

:::warning Token Compartilhado
O token interno tem **nomes diferentes nos dois lados**: no API Gateway é `IA_ANALYZE_REMOTE_TOKEN`, no IA Analyze é `IA_ANALYZE_INTERNAL_TOKEN`. Ambos devem ter o **mesmo valor** — o Gateway o envia no header `x-ia-analyze-token` e o serviço valida. Use uma string longa e aleatória (mínimo 32 caracteres).
:::

---

## Passo 4 — Configure o Banco de Dados

O schema do banco está versionado em `database/sql/` como arquivos DDL organizados por tipo de objeto (`tables/`, `policies/`, `triggers/`, `functions/`). Aplique esses scripts no seu projeto Supabase (via SQL Editor ou Supabase CLI). Consulte `database/sql/README.md` para a estrutura e `database/sql/DESCRICOES.md` para a descrição de cada objeto.

As principais tabelas são:

| Tabela | Para quê |
|---|---|
| `public.enterprise` | Dados da empresa |
| `public.collecting_data_enterprise` | Configurações de coleta e catálogo |
| `public.catalog_items` | Produtos, serviços e departamentos |
| `public.feedback` | Feedbacks coletados |
| `public.feedback_analysis` | Análises geradas pela IA |
| `public.feedback_insights_report` | Relatórios de insights consolidados |
| `public.tracked_devices` | Controle anti-spam por dispositivo |

---

## Passo 5 — Inicie o Ambiente

### Todos os serviços juntos (recomendado)

```bash
npm run dev:web-apiGateway-iaAnalyze
```

Isso inicia:
- **Frontend** em `http://localhost:5173`
- **API Gateway** em `http://localhost:3000`
- **IA Analyze** em `http://localhost:4100`

### Serviços individualmente

```bash
npm run dev:web   # Apenas frontend
npm run dev:api   # Apenas API Gateway
npm run dev:ia    # Apenas IA Analyze
```

---

## Passo 6 — Verifique a Instalação

```bash
curl http://localhost:3000/api/health
# → { "ok": true }

curl http://localhost:4100/internal/health
# → { "ok": true, "service": "ia-analyze" }
```

Se ambos retornarem `ok: true`, o ambiente está funcionando.

---

## Troubleshooting

| Erro | Causa | Solução |
|---|---|---|
| `Missing Gemini API key` | `GEMINI_API_KEY` vazio | Verifique o `.env` do `ia-analyze` |
| `401 unauthorized_internal_request` | Tokens internos diferentes | Iguale `IA_ANALYZE_INTERNAL_TOKEN` nos dois serviços |
| `422 collecting_data_required` | Empresa sem dados de contexto | Preencha **Objetivo** e **Resumo** em Configurações |
| `422 insufficient_feedbacks` | Menos de 5 feedbacks disponíveis | Colete mais feedbacks antes de analisar |
| `ECONNREFUSED :4100` | IA Analyze não está rodando | Execute `npm run dev:ia` |

---

## Executar os Testes

```bash
npm run test:web   # Testes do frontend (Vitest)
npm run lint       # Lint em todos os serviços
```
