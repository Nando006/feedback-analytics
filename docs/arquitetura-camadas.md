## Arquitetura de camadas e fluxo de dados

Este documento descreve a organização do projeto por camadas, o fluxo padrão para leitura (GET), criação/atualização (POST/PATCH/PUT) e remoção (DELETE) de dados, e onde entram os “loaders” e “actions” do React Router. Inclui também um mapeamento dos principais arquivos por camada.

### Sumário

- Visão geral por camadas
- Front-end: páginas, componentes, rotas, loaders e actions
- Serviços (cliente)
- Back-end (Express + Supabase)
- Fluxo padrão: ler, enviar e atualizar dados
- Mapa de arquivos por camada
- Contratos práticos (o que esperar de cada peça)
- Boas práticas e padronização sugeridas

---

## Visão geral por camadas

- Camada de UI (apresentação)
	- Páginas: telas completas consumidas pelo roteador
	- Componentes: elementos reutilizáveis (cards, headers, filtros etc.)
	- Layouts: cascas visuais que envolvem páginas
	- Estilos: Tailwind/CSS organizados por contexto (público/usuário)

- Camada de Roteamento e Data APIs (React Router)
	- Rotas: árvore de rotas e composição de telas
	- Loaders: carregamento de dados antes da renderização por rota
	- Actions: submissões/mutações disparadas por formulários das rotas

- Camada de Serviços (cliente)
	- “Thin clients” para a API: funções que falam com os endpoints (`/api/public/*`, `/api/protected/*`)
	- Utilitário HTTP central com `credentials: 'include'` e tratamento de erro

- Camada de Back-end (Express + Supabase)
	- Servidor Express com rotas públicas e protegidas
	- Middlewares de autenticação
	- Integração com Supabase (cookies/sessão)
	- Endpoints separados por domínio (user, enterprise, feedbacks etc.)

---

## Front-end

### Páginas e componentes

- Páginas públicas: `pages/public/*`
	- Exemplos: `home.tsx`, `login.tsx`, `register.tsx`, `qrcode/enterprise.tsx`
- Páginas do usuário: `pages/user/*`
	- Exemplos: `dashboard.tsx`, `profile.tsx`, `feedbacks/**`, `qrcodes/**`, `edit/**`, `insights/**`
- Componentes: `components/**`
	- Exemplos: `components/user/feedbacks/*`, `components/user/layout/*`, `components/public/*`
- Layouts:
	- Público: `layouts/public.tsx`
	- Usuário: `layouts/user.tsx`
- Estilos: `styles/**`

### Rotas, loaders e actions

- Rotas públicas: `src/routes/public.tsx`
	- Ex.: associações com `ActionLogin` (login) e `ActionRegister` (registro)
- Rotas do usuário: `src/routes/user.tsx`
	- Possui `loader={LoaderUserProtected}` para proteger e hidratar dados
	- Associa `ActionProfile` e `ActionCollectingData` às rotas de edição

Como se encaixam:
- Loader
	- Executa antes de renderizar a rota
	- Busca dados necessários para a tela via serviços do cliente
	- Exemplo: `src/routes/loaders/loaderUserProtected.ts` carrega:
		- Usuário: `getAuthUser()` → `/api/protected/user/auth_user`
		- Empresa: `getEnterprise()` → `/api/protected/user/enterprise`
		- Coleta (se houver empresa): `getCollectingDataEnterprise()` → `/api/protected/user/collecting_data`
	- Em caso de não autenticado, redireciona com `redirect('/login')`

- Action
	- Disparada por `<Form method="post">`/`useSubmit` numa rota com `action={...}`
	- Lê `request.formData()`, valida, chama a API via serviços e retorna:
		- `redirect('/alguma-rota')` em sucesso, ou
		- `Response(JSON)` para consumo por `useActionData()`/`fetcher`
	- Exemplos:
		- `src/routes/actions/actionLogin.ts`: autentica via `/api/public/auth/login` e redireciona
		- `src/routes/actions/actionProfile.ts`: múltiplos intents (`update_full_name`, `update_email`, `start_phone`, `verify_phone`) que chamam `src/services/profile.ts`

---

## Serviços (cliente)

- HTTP central: `src/services/http.ts`
	- `getJson<T>(path, init?)` e `postJson<T>(path, body, init?)`
	- Sempre usa `credentials: 'include'`
	- Em `!res.ok` lança erro com `status` acoplado

- Domínios:
	- Autenticação (dados do usuário): `src/services/authUser.ts` → `getAuthUser()`
	- Empresa: `src/services/enterprise.ts` → `getEnterprise()`
	- Coleta: `src/services/collectingDataEnterprise.ts`
		- `getCollectingDataEnterprise()` (trata 400/404 como `null`)
		- `updateCollectingDataEnterprise(payload)` via `PATCH`
	- Perfil: `src/services/profile.ts`
		- `updateMetadados(full_name)`
		- `updateEmail(email)`
		- `startPhoneVerification(phone)`
		- `verifyPhone(token)`

Observação: algumas actions usam `fetch` direto (ex.: login) — ver seção de padronização.

---

## Back-end (Express + Supabase)

- Servidor: `src/server/express/index.ts`
	- Registra rotas públicas e protegidas
	- `app.use(express.json())`, `app.set('trust proxy', 1)`

- Rotas:
	- Públicas: `src/server/express/routes/public.ts`
		- Endpoints em `routes/endpoints/public/**`
		- Exemplos: login, logout, register, qrcode feedback, enterprise pública
	- Protegidas: `src/server/express/routes/protected.ts`
		- Endpoints em `routes/endpoints/protected/**`
		- Exemplos: `user.ts`, `enterprise.ts`, `metadados.ts`, `email.ts`, `collectingDataEnterprise.ts`, `feedbacks.ts`, `collectionPointsQr.ts`

- Autenticação e sessão:
	- `src/server/express/supabase.ts`: `createSupabaseServerClient(req, res, { remember? })`
		- Gerencia cookies (get/set) com `httpOnly`, `secure` (em produção), `sameSite: 'lax'`, `path: '/'`
		- `persistSession: false`, `autoRefreshToken: false` no server-side

- Exemplo de endpoint protegido:
	- `GET /api/protected/user/auth_user` em `routes/endpoints/protected/user.ts`
		- Usa middleware `requireAuth` (em `middleware/auth.js`)
		- Retorna `{ user: req.user }`

---

## Fluxo padrão

### Ler dados (READ)
1) Rota define `loader`
2) Loader chama serviços do cliente (`src/services/**`)
3) Serviços chamam a API Express (`/api/protected/*` ou `/api/public/*`)
4) API acessa Supabase/DB, responde JSON
5) Componente consome os dados via `useLoaderData()`

### Enviar/atualizar/deletar (WRITE)
1) UI envia formulário para a rota com `action`
2) `action` lê `formData`, valida e aciona serviços / `fetch`
3) Serviço chama API com `POST/PATCH/PUT/DELETE` (com `credentials: 'include'`)
4) `action` retorna `redirect` ou `Response(JSON, { status })`
5) UI navega e/ou lê `useActionData()`/`fetcher` para feedback

---

## Mapa de arquivos por camada

- UI
	- Páginas públicas: `pages/public/*`
	- Páginas do usuário: `pages/user/*`
	- Componentes: `components/**`
	- Layouts: `layouts/public.tsx`, `layouts/user.tsx`
	- Estilos: `styles/**`

- Roteamento e Data APIs
	- Árvores de rotas: `src/routes/public.tsx`, `src/routes/user.tsx`, `src/routes/admin.tsx`, `src/routes/source.tsx`
	- Loader protegido: `src/routes/loaders/loaderUserProtected.ts`
	- Actions: `src/routes/actions/*` (login, register, profile, collecting-data)

- Serviços (cliente)
	- HTTP base: `src/services/http.ts`
	- Domínios: `src/services/authUser.ts`, `enterprise.ts`, `enterprisePublic.ts`, `collectingDataEnterprise.ts`, `feedbacks.ts`, `logout.ts`, `profile.ts`, etc.

- Back-end (Express)
	- Server: `src/server/express/index.ts`
	- Rotas públicas/protegidas: `src/server/express/routes/{public,protected}.ts`
	- Endpoints por domínio: `src/server/express/routes/endpoints/{public,protected}/*.ts`
	- Middleware: `src/server/express/middleware/*`
	- Supabase SSR: `src/server/express/supabase.ts`

- Tipos/utilitários
	- Entidades: `lib/interfaces/entities/*`
	- Utils: `lib/utils/*`

---

## Contratos práticos

- Loader (por rota)
	- Entrada: `LoaderFunctionArgs`
	- Saída: objeto serializável para `useLoaderData()`
	- Erros: `redirect` (ex.: não autenticado) ou erro tratado via `errorElement`

- Action (por rota)
	- Entrada: `ActionFunctionArgs` com `request.formData()`
	- Saída:
		- Sucesso: `redirect('/rota')` ou `{ ok: true }`
		- Erro: `Response(JSON, { status })`
	- Estratégia comum: `intent` em formulários para múltiplas operações com uma action (ex.: `ActionProfile`)

- Serviço HTTP
	- Sucesso: `res.json()` tipado
	- Erro: lança `Error` com `status` em `!res.ok` (facilita handlers genéricos)

---

## Boas práticas e padronização sugeridas

- Padronizar actions para passarem por serviços
	- Ex.: criar `src/services/auth.ts` com `login()` e usá-lo em `ActionLogin` para evitar `fetch` direto — facilita reuso e testes.

- Completar o kit HTTP
	- Adicionar `patchJson`, `putJson`, `deleteJson` em `src/services/http.ts` e substituir usos de `fetch` manual (ex.: `updateCollectingDataEnterprise`) por helpers.

- Respostas da API consistentes
	- Padronizar payloads `{ data, error }` ou `ok/erro` + status (400/401/404/409/500) para diminuir condicionais no cliente.

- Padrão de intents
	- Manter o padrão de `intent` em forms com múltiplas operações (como em `ActionProfile`) para evitar fragmentar muitas actions/endpoints.

- Tratamento de erros silenciosos esperados
	- Seguir o exemplo de `getCollectingDataEnterprise()` (400/404 → `null`) para não poluir o console quando for caso de “não encontrado” esperado.

- Tipagem compartilhada
	- Garantir que `lib/interfaces/**` cubra payloads e respostas dos serviços/actions para reduzir `any` e inconsistências.

---

Se quiser, podemos complementar este documento com um fluxo ponta a ponta (por exemplo, Profile) mostrando exatamente como a tela consome `useLoaderData`, como o formulário dispara `action` e o que o endpoint executa no back-end.

