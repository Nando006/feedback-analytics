# Frontend — Fluxo de Autenticação e Navegação

Este documento descreve como o frontend decide o que mostrar para cada usuário: quais rotas são públicas, como a sessão é verificada, o que acontece quando ela expira e como cada fluxo de auth funciona passo a passo.

> O mapa completo de URLs está em [Visão Geral → Mapa de Rotas](./visao-geral.md). Este documento foca no comportamento, não na lista.

---

## Classificação das Rotas

| Tipo | Rotas | Acesso |
|---|---|---|
| **Pública** | `/`, `/login`, `/register`, `/forgot-password`, `/auth/reset-password`, `/auth/success`, `/auth/link-expired`, `/feedback/qrcode` | Qualquer visitante, sem verificação |
| **Protegida** | Tudo em `/user/*` | Exige sessão válida — verificada antes de renderizar |

---

## Guarda de Rotas — `LoaderUserProtected`

Todas as rotas `/user/*` são filhas de um único layout que declara `LoaderUserProtected` como loader. Isso significa que **antes de qualquer tela protegida ser renderizada**, o loader executa:

```
Usuário navega para /user/*
        ↓
LoaderUserProtected executa
        ↓
  Chama loadUserContextData()
        ↓
  ServiceGetUser() → GET /api/protected/user/auth_user
  ServiceGetEnterprise() → GET /api/protected/... (paralelo)
        ↓
    ┌───┴───┐
  Sucesso   Erro (401, rede, etc.)
    ↓           ↓
Renderiza   throw redirect('/login')
  a tela
```

### O que `loadUserContextData` retorna

Se a sessão for válida, o loader devolve para a tela:

```ts
{
  user,        // dados do usuário autenticado (id, email, metadata)
  enterprise,  // dados da empresa (ou objeto parcial se ainda não cadastrou)
  collecting,  // configurações de coleta de dados (pode ser null)
}
```

Esses dados ficam disponíveis via `useRouteLoaderData` em qualquer componente dentro da área protegida — sem necessidade de chamar a API novamente.

---

## Gerenciamento de Sessão

### Como a sessão é armazenada

O token usado nas chamadas à API trafega via **cookie HttpOnly**, gerenciado pelo backend. Todas as requisições para `/api/protected/*` e `/api/public/auth/*` usam `credentials: 'include'`, que envia o cookie automaticamente. A sessão do Supabase, por outro lado, é persistida em **localStorage** por padrão (`persistSession: true`, sem storage customizado).

### Renovação automática de token

O cliente Supabase é inicializado com:

```ts
{
  auth: {
    persistSession: true,   // mantém a sessão entre recarregamentos
    autoRefreshToken: true, // renova o token antes de expirar, silenciosamente
  }
}
```

O Supabase cuida da renovação do token em background. Na prática, o usuário raramente experimenta uma expiração de sessão durante uso ativo.

### O que acontece quando a sessão expira

Cenário: o usuário fica inativo por muito tempo e o token expira de vez.

1. Na próxima navegação para qualquer rota `/user/*`, o `LoaderUserProtected` executa
2. `ServiceGetUser()` faz `GET /api/protected/user/auth_user`
3. O backend retorna `401` pois o cookie é inválido/expirado
4. `getJson` lança um `HttpError` com `status: 401`
5. O `try/catch` do `LoaderUserProtected` captura o erro
6. `throw redirect('/login')` — o usuário é redirecionado para o login

Não há tela de "sessão expirada" — o redirecionamento é imediato e silencioso.

---

## Fluxo de Login

```
/login → usuário preenche email + senha (+ opção "lembrar")
        ↓
ActionLogin extrai os campos do FormData
        ↓
ServiceLogin → POST /api/public/auth/login  (credentials: 'include')
        ↓
    ┌───┴───┐
  ok: true   ok: false
    ↓              ↓
redirect       retorna payload de erro para a tela
/user/dashboard?login=success
```

### Tratamento de erros no login

| Cenário | Mensagem exibida |
|---|---|
| Credenciais inválidas | "E-mail ou senha incorretos." |
| Conta não confirmada (e-mail pendente) | **Mesma** mensagem de credenciais inválidas — por segurança (RNE-014, proteção contra enumeração de usuários) a UI não revela que a conta existe mas está pendente, e não oferece reenvio neste ponto |
| Rate limit (429) | "Muitas tentativas de login. Aguarde e tente novamente." |
| Servidor indisponível (5xx) | "Serviço de login temporariamente indisponível." |
| Sem conexão | "Não foi possível conectar ao servidor. Verifique sua conexão." |

> O reenvio de confirmação permanece acessível pelos fluxos de pós-cadastro e de [link de ativação expirado](#fluxo-de-recuperação-de-senha) — apenas não é exposto a partir do erro de login, para não vazar a existência da conta.

---

## Fluxo de Logout

```
Usuário clica em "Sair"
        ↓
ActionLogout valida o intent (INTENT_LOGOUT)
        ↓
ServiceLogout executa dois passos em sequência:
  1. supabase.auth.signOut()    → limpa a sessão Supabase local
  2. POST /api/public/auth/logout → invalida o cookie no servidor
        ↓
redirect('/login')
```

Os dois passos garantem que tanto o lado cliente (Supabase) quanto o lado servidor (cookie) sejam limpos. Falhas no `signOut` do Supabase são ignoradas (`catch(() => {})`) para não bloquear o logout.

---

## Fluxo de Recuperação de Senha

### Etapa 1 — Solicitar redefinição (`/forgot-password`)

```
Usuário informa o e-mail
        ↓
ActionForgotPassword → ServiceForgotPassword
        ↓
POST /api/public/auth/forgot-password
        ↓
Resposta sempre genérica (não revela se o e-mail existe):
"Se este e-mail estiver cadastrado, você receberá as instruções em breve."
```

### Etapa 2 — Redefinir senha (`/auth/reset-password`)

```
Usuário clica no link recebido por e-mail
        ↓
O link estabelece uma sessão temporária via Supabase
        ↓
Usuário define nova senha
        ↓
ActionResetPassword → ServiceResetPassword
        ↓
PATCH /api/protected/user/password  (usa a sessão temporária do link)
        ↓
    ┌───┴───┐
  ok: true   Link expirado/inválido (401)
    ↓              ↓
Senha alterada  "O link de redefinição expirou. Solicite um novo."
```

---

## Fluxo de Cadastro

```
/register → usuário preenche os dados
        ↓
ActionRegister → POST /api/public/auth/register
        ↓
Supabase envia e-mail de confirmação
        ↓
Usuário clica no link → /auth/success
        ↓
Conta ativada → usuário pode fazer login
```

Se o e-mail de confirmação não chegou, o usuário pode reenviar via `ActionResendConfirmation`.

---

## Resolução da URL da API

O utilitário `http.ts` resolve automaticamente qual URL da API usar:

| Ambiente | Comportamento |
|---|---|
| **Local / variável explícita** | Usa `VITE_API_BASE_URL` do `.env` |
| **Vercel Preview** | Deriva a URL da API a partir do hostname do frontend (ex: `feedback-analytics-web-abc123.vercel.app` → `feedback-analytics-api-abc123.vercel.app`) |

Isso garante que cada deploy de preview do frontend aponte automaticamente para o deploy de preview correspondente da API, sem configuração manual.

---

## Veja Também

- [Visão Geral — Mapa de Rotas](./visao-geral.md)
- [Arquitetura e Estrutura](./arquitetura-estrutura.md)
- [System Design](./system-design.md)
