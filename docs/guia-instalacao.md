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
VITE_API_GATEWAY_URL=http://localhost:3001
```

### `backends/api-gateway/.env`

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
INTERNAL_SERVICE_TOKEN=um_token_secreto_compartilhado
IA_ANALYZE_URL=http://localhost:3002
PORT=3001
```

### `services/ia-analyze/.env`

```env
GEMINI_API_KEY=sua_chave_gemini_aqui
INTERNAL_SERVICE_TOKEN=um_token_secreto_compartilhado
PORT=3002
```

:::warning Token Compartilhado
O `INTERNAL_SERVICE_TOKEN` deve ser **idêntico** no API Gateway e no IA Analyze. Ele autentica a comunicação interna entre os serviços. Use uma string longa e aleatória (mínimo 32 caracteres).
:::

---

## Passo 4 — Configure o Banco de Dados

Aplique as migrations no Supabase:

```bash
# Via Supabase CLI
supabase db push
```

As tabelas criadas são:

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
- **API Gateway** em `http://localhost:3001`
- **IA Analyze** em `http://localhost:3002`

### Serviços individualmente

```bash
npm run dev:web   # Apenas frontend
npm run dev:api   # Apenas API Gateway
npm run dev:ia    # Apenas IA Analyze
```

---

## Passo 6 — Verifique a Instalação

```bash
curl http://localhost:3001/health
# → { "ok": true }

curl http://localhost:3002/health
# → { "ok": true, "service": "ia-analyze" }
```

Se ambos retornarem `ok: true`, o ambiente está funcionando.

---

## Troubleshooting

| Erro | Causa | Solução |
|---|---|---|
| `Missing Gemini API key` | `GEMINI_API_KEY` vazio | Verifique o `.env` do `ia-analyze` |
| `401 unauthorized_internal_request` | Tokens internos diferentes | Iguale `INTERNAL_SERVICE_TOKEN` nos dois serviços |
| `422 collecting_data_required` | Empresa sem dados de contexto | Preencha **Objetivo** e **Resumo** em Configurações |
| `422 insufficient_feedbacks` | Menos de 5 feedbacks disponíveis | Colete mais feedbacks antes de analisar |
| `ECONNREFUSED :3002` | IA Analyze não está rodando | Execute `npm run dev:ia` |

---

## Executar os Testes

```bash
npm run test:web   # Testes do frontend (Vitest)
npm run lint       # Lint em todos os serviços
```
