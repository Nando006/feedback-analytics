# Fluxo de Registro (pages/public/register.tsx)

Este documento descreve o fluxo completo da página de registro: front-end (página, formulário e action), backend (Express) e banco de dados (Supabase Auth), indicando por onde os dados passam, arquivos envolvidos e decisões de negócio.

## Visão geral

- `pages/public/register.tsx` renderiza o layout e injeta o formulário `FormRegister` dentro de um `Card`.
- `FormRegister` valida com Zod no cliente e envia os dados para a action `/register` usando `useSubmit`.
- A `ActionRegister` converte `FormData` → JSON e faz POST para `/api/public/auth/register` no backend.
- O backend revalida com Zod, faz pré-checagens de duplicidade (RPCs), chama `supabase.auth.signUp` com metadados e define `emailRedirectTo` para o callback.
- O Supabase envia e-mail de confirmação. O callback troca o código por sessão e redireciona para `/auth/success?next=/user/dashboard`.

## Front-end

### Página
- Arquivo: `pages/public/register.tsx`
  - Renderiza `Card` com `children={<FormRegister />}` e link para `/login`.

### Formulário
- Arquivo: `components/public/forms/formRegister.tsx`
  - Bibliotecas: `react-hook-form`, `@hookform/resolvers/zod`.
  - Schema: `lib/schemas/public/registerSchema.ts` (compartilhado com o backend).
  - Campos: `accountType (CPF|CNPJ)`, `fullName`, `document`, `email`, `phone (+55...)`, `password`, `confirmPassword`, `terms`.
  - Submissão: monta `FormData` e chama `useSubmit` com `method:'post'`, `action:'/register'`.
  - Exibe sucesso/erro usando `useActionData()`.

### Rotas e Action
- Arquivo: `src/routes/public.tsx`
  - `<Route path="register" element={<Register />} action={ActionRegister} />`
- Arquivo: `src/routes/actions/actionRegister.ts`
  - Lê `formData`, monta `payload` JSON e faz:
    ```ts
    fetch('/api/public/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    })
    ```
  - Se `res.ok`: retorna `{ ok: true }` (UI mostra aviso de confirmação por e-mail).
  - Senão: retorna `{ error, message? }` com status do backend.

### Validação (cliente)
- Arquivo: `lib/schemas/public/registerSchema.ts`
  - Discriminado por `accountType`:
    - CPF: `fullName` (2–120), `document` (11 dígitos)
    - CNPJ: `fullName` (2–160), `document` (14 dígitos)
  - Base comum: `email` válido, `phone` `^\+55\d{10,11}$`, `password` ≥8, `confirmPassword` igual a `password`, `terms` = true.

## Backend (Express)

### Endpoint de registro
- Arquivo: `src/server/express/routes/endpoints/public/register.ts`
- Rota: `POST /api/public/auth/register`
- Passos:
  1. `registerSchema.safeParse(req.body)` → 400 `{ error:'invalid_payload', issues }` se inválido.
  2. Monta metadados: `account_type`, `full_name`, `document`, `phone`, `terms_accepted_at`, `terms_version`.
  3. Calcula base URL e `emailRedirectTo = ${base}/api/public/auth/callback`.
  4. Cria cliente SSR: `createSupabaseServerClient(req, res)`.
  5. Pré-validações (RPCs):
     - `phone_exists(p_phone)` → se true, 409 `{ error:'phone_taken' }`.
     - `document_exists(p_document)` → se true, 409 `{ error:'document_taken' }`.
  6. `supabase.auth.signUp({ email, password, options: { data: meta, emailRedirectTo } })`.
  7. Trata erros comuns do Auth:
     - E-mail já cadastrado → 409 `{ error:'email_taken' }`.
     - Mensagens específicas: `phone_already_exists`, `document_already_exists`, `document is required`, `database error ...` → mapeadas para 409/400 com mensagens amigáveis.
  8. Sucesso: 200 `{ ok: true, message: 'confirmation_required' }`.

### Callback de confirmação
- Arquivo: `src/server/express/routes/endpoints/public/callback.ts`
- Rota: `GET /api/public/auth/callback`
- Fluxo:
  - Lê `type`, `token_hash` (ou `token`), `next` (default `/user/dashboard`).
  - `email_change` → `supabase.auth.verifyOtp`; demais → `supabase.auth.exchangeCodeForSession(req.url)`.
  - Redireciona para `/auth/success?next=...`.

### Outras peças
- `src/server/express/supabase.ts` → cliente SSR com cookies httpOnly; `auth.persistSession=false`/`autoRefreshToken=false`.
- `src/server/express/routes/public.ts` → registra `Register(app)` e `Callback(app)`.
- `pages/public/authSuccess.tsx` → mostra "Conta verificada" e redireciona.

## Banco de dados (Supabase Auth)
- `supabase.auth.signUp` persiste em `auth.users` e dispara o e-mail de confirmação.
- Metadados (`options.data`) ficam em `user.user_metadata`.
- RPCs `phone_exists`/`document_exists` devem estar criadas via migração.

## Contratos

### POST /api/public/auth/register
Request (ex. CPF):
```json
{
  "accountType":"CPF",
  "fullName":"Nome Completo",
  "document":"12345678901",
  "email":"user@example.com",
  "phone":"+5511999999999",
  "password":"********",
  "confirmPassword":"********",
  "terms": true
}
```
Responses:
- 200: `{ "ok": true, "message": "confirmation_required" }`
- 400: `{ "error":"invalid_payload", "issues":{...} }` | `{ "error":"document_required" | "database_error", "message":"..." }`
- 409: `{ "error":"email_taken" | "phone_taken" | "document_taken", "message":"..." }`

## Arquivos envolvidos (resumo)
Front-end:
- `pages/public/register.tsx`, `components/public/forms/formRegister.tsx`, `components/public/shared/card.tsx`
- `lib/schemas/public/registerSchema.ts`, `src/routes/public.tsx`, `src/routes/actions/actionRegister.ts`
Backend:
- `src/server/express/routes/endpoints/public/register.ts`, `.../public/callback.ts`, `src/server/express/supabase.ts`, `src/server/express/routes/public.ts`
Pós-callback:
- `pages/public/authSuccess.tsx`

