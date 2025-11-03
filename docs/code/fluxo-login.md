# Fluxo de Login (pages/public/login.tsx)

Este documento descreve, de ponta a ponta, como funciona o fluxo de login no projeto: do front-end (formulário e action), passando pelo backend (Express) até o provedor de autenticação (Supabase). Inclui os arquivos envolvidos, os dados que trafegam e as decisões de controle.

## Visão geral

- A página `pages/public/login.tsx` renderiza um `Card` com o formulário `FormLogin`.
- O `FormLogin` valida os campos com Zod (no cliente) e envia os dados usando o mecanismo de actions do React Router (`useSubmit`) para a rota `/login`.
- A rota pública `src/routes/public.tsx` associa o caminho `login` a uma `action` (`ActionLogin`), que converte o `FormData` e faz um POST JSON para o backend em `/api/public/auth/login`.
- O backend Express valida novamente o payload com Zod (no servidor) e realiza o login via Supabase (`auth.signInWithPassword`), configurando cookies httpOnly; o parâmetro `remember` controla a expiração (sessão vs. 30 dias).
- Em sucesso, a `action` redireciona o usuário para `/user/dashboard`. Em erro, retorna um JSON com o código de erro e status apropriado (400/401) para a UI.
- Em rotas protegidas, a sessão é lida do cookie httpOnly no servidor (middleware `requireAuth`), e o front-end pode obter o usuário autenticado via `GET /api/protected/user/auth_user`.

## Front-end

### Página e componentes

- `pages/public/login.tsx`
  - Renderiza layout visual (gradiente, elementos decorativos) e o `Card` com `children={<FormLogin />}`.
- `components/public/shared/card.tsx`
  - Componente visual que mostra título, texto, ícone e links de navegação (login/registro).
- `components/public/forms/formLogin.tsx`
  - Usa `react-hook-form` + `zodResolver(loginSchema)` para validação cliente.
  - Campos: `email` (ou `phone`), `password`, `remember`.
  - Em `onSubmit`, cria `FormData` e chama `useSubmit` com:
    - `method: 'post'`, `action: '/login'`, `encType: 'application/x-www-form-urlencoded'`.
  - Campos visuais (inputs) são abstraídos em:
    - `components/public/forms/fields/fieldsLogin/fieldText.tsx`
    - `components/public/forms/fields/fieldsLogin/fieldPassword.tsx`
    - `components/public/forms/fields/fieldsLogin/fieldRemember.tsx`

### Rotas e Action do React Router

- `src/routes/public.tsx`
  - Define a rota pública `login` com `action={ActionLogin}`:
    ```tsx
    <Route path="login" element={<Login />} action={ActionLogin} />
    ```
- `src/routes/actions/actionLogin.ts`
  - Recebe o `request`, faz `await request.formData()`, extrai `email` ou `phone`, `password`, `remember`.
  - Constrói um corpo JSON com `{ email|phone, password, remember }` e faz `fetch('/api/public/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(...) })`.
  - Se `res.ok`, retorna `redirect('/user/dashboard')`.
  - Senão, repassa o erro como `Response(JSON.stringify(payload), { status: res.status })`.

### Esquema de validação (cliente)

- `lib/schemas/public/loginSchema.ts`
  - `z.union([ { email, password, remember }, { phone, password, remember } ])`.
  - Regras:
    - `email`: e-mail válido; `phone`: regex `^\+55\d{10,11}$` (formato +55DDXXXXXXXXX)
    - `password`: min 6 chars; `remember`: boolean (default false)

## Backend (Express)

### Servidor e rotas

- `src/server/express/index.ts`
  - Cria app Express, habilita `express.json()` e carrega rotas: `PublicRoutes(app)` e `ProtectedRoutes(app)`.
- `src/server/express/routes/public.ts`
  - Registra endpoints públicos, incluindo `Login(app)`.
- `src/server/express/routes/endpoints/public/login.ts`
  - `POST /api/public/auth/login`
  - Passos:
    1. Valida `req.body` com `loginSchema.safeParse(req.body)`. Erro: `400 { error: 'invalid_payload' }`.
    2. Cria cliente Supabase server-side: `createSupabaseServerClient(req, res, { remember })`.
    3. Executa `supabase.auth.signInWithPassword`:
       - Se veio `email`, usa `{ email, password }`; senão usa `{ phone, password }`.
    4. Erro de credenciais: `401 { error: 'invalid_credentials' }`.
    5. Sucesso: `200 { ok: true, user: data.user ?? null }` e cookies httpOnly definidos na resposta.

### Sessão com cookies httpOnly (SSR Supabase)

- `src/server/express/supabase.ts`
  - Usa `@supabase/ssr` → `createServerClient(url, anonKey, { cookies: { getAll, setAll }, auth: { persistSession:false, autoRefreshToken:false } })`.
  - `setAll` escreve cookies na resposta com:
    - `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, `secure: (NODE_ENV==='production')`.
    - Se `remember: true`, adiciona `maxAge` (~30 dias). Caso contrário, cookies de sessão.

### Rotas protegidas e middleware de autenticação

- `src/server/express/middleware/auth.ts` (`requireAuth`)
  - Cria `supabase` com os cookies do request (`createSupabaseServerClient`).
  - Chama `supabase.auth.getUser()`; se não houver usuário, responde `401 { error: 'unauthorized' }`.
  - Em sucesso, anexa `req.user` e chama `next()`.
- `src/server/express/routes/endpoints/protected/user.ts`
  - `GET /api/protected/user/auth_user` (protegido por `requireAuth`)
  - Retorna `{ user: req.user }`.

## Banco de dados (Supabase Auth)

- `src/supabase/supabaseClient.ts` (cliente front-end)
  - Define o client do Supabase com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (persistência de sessão no cliente habilitada, embora o login aqui use o fluxo via backend/SSR).
- O login em si chama `supabase.auth.signInWithPassword` do lado do servidor (via `@supabase/ssr`).
- Os usuários e sessões são gerenciados pelo Supabase Auth (tabelas internas, como `auth.users`). Não há query direta de banco no fluxo de login — tudo é abstraído pelo provider de autenticação.

## Fluxo de dados passo a passo

1. Usuário acessa `/login` → `pages/public/login.tsx` renderiza `FormLogin` dentro do `Card`.
2. Usuário preenche email (ou phone), password e `remember`.
3. Validação cliente (Zod) em `FormLogin`:
   - Se inválido, erros exibidos nos campos.
   - Se válido, `useSubmit` envia `FormData` para a `action` da rota `/login`.
4. `ActionLogin` lê `FormData`, monta JSON e faz `POST /api/public/auth/login` (mesma origem).
5. Express recebe a requisição JSON, valida com o mesmo `loginSchema` (server-side).
6. Cria `createSupabaseServerClient(req, res, { remember })` e chama `auth.signInWithPassword`.
7. Supabase valida credenciais. Em sucesso, biblioteca grava cookies httpOnly na resposta (res.set-cookie) via `setAll`.
8. Backend responde `200 { ok: true, user }`. A `ActionLogin` vê `res.ok` e retorna `redirect('/user/dashboard')`.
9. Em `/user/dashboard` (rota protegida), requisições subsequentes podem chamar `GET /api/protected/user/auth_user`.
   - O middleware `requireAuth` lê os cookies httpOnly, valida a sessão via `supabase.auth.getUser()` e retorna o usuário.

## Contratos e formatos

- Requisição para o backend (JSON):
  ```json
  { "email": "user@example.com", "password": "******", "remember": true }
  // ou
  { "phone": "+5511999999999", "password": "******", "remember": false }
  ```
- Respostas do backend:
  - 200 OK: `{ "ok": true, "user": { ... } }`
  - 400 Bad Request: `{ "error": "invalid_payload" }`
  - 401 Unauthorized: `{ "error": "invalid_credentials" }`
- Redirecionamentos:
  - Em sucesso: `ActionLogin` faz `redirect('/user/dashboard')`.

## Arquivos envolvidos (resumo e papéis)

Front-end (UI e rotas):
- `pages/public/login.tsx` → Página visual do login.
- `components/public/shared/card.tsx` → Moldura visual com título/links.
- `components/public/forms/formLogin.tsx` → Formulário, validação cliente e submissão.
- `lib/schemas/public/loginSchema.ts` → Esquema Zod compartilhado (cliente/servidor).
- `src/routes/public.tsx` → Declara a rota `/login` e liga a `ActionLogin`.
- `src/routes/actions/actionLogin.ts` → Converte `FormData` → JSON e chama API.
- `src/services/authUser.ts` + `src/services/http.ts` → Utilitários para chamadas autenticadas (pós-login).

Backend (API e sessão):
- `src/server/express/index.ts` → Inicializa o servidor e aplica rotas.
- `src/server/express/routes/public.ts` → Registra endpoints públicos.
- `src/server/express/routes/endpoints/public/login.ts` → Handler do login.
- `src/server/express/supabase.ts` → Cliente SSR do Supabase e gestão de cookies.
- `src/server/express/middleware/auth.ts` → Middleware para rotas protegidas.
- `src/server/express/routes/endpoints/protected/user.ts` → Retorna usuário autenticado.

Infra Supabase:
- `src/supabase/supabaseClient.ts` → Cliente Supabase no front (não usado diretamente no login via backend, mas disponível).

## Considerações e edge cases

- Validação dupla: cliente (UX) e servidor (segurança). Mesmo com validação cliente, o backend SEMPRE revalida.
- `remember: true` ativa cookies com `maxAge` (~30 dias). Caso contrário, cookies de sessão.
- O `fetch` na `ActionLogin` não passa `credentials: 'include'`, o que é aceitável para login (cookies são setados pelo servidor e o navegador os armazena por mesma origem). As utilidades `getJson/postJson` já usam `credentials: 'include'` para chamadas autenticadas subsequentes.
- Erros retornados pela `ActionLogin` ficam disponíveis para a UI via mecanismos do React Router (p.ex., `useActionData`), ainda que o template atual não os exiba explicitamente.
- Suporte a login por `email` ou `phone` (formato BR: `+55DDXXXXXXXXX`).

## Como verificar rapidamente

1. Preencha email/phone, senha e marque/desmarque "Lembrar de mim".
2. Observe, via ferramentas do navegador (aba de rede), o `POST /api/public/auth/login` e o `Set-Cookie` httpOnly.
3. Em sucesso, você será redirecionado para `/user/dashboard`.
4. Opcional: chame `GET /api/protected/user/auth_user` (via app) para conferir o usuário carregado pela sessão.

---
