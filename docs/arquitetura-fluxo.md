# Fluxo da Arquitetura

### Resumo do Fluxo
- `GET` dados da rota
  - Rota
  - Loader
  - Serviço
  - API
  - `useLoaderData()`
- `POST/PUT/PATCH/DELETE`
  - Rota
  - Action
  - Serviço
  - API
  - Redirect ou `useActionData()`
---
### Leitura `GET` antes de renderizar a tela: use Loader
- O Loader roda antes de montar o componente, busca os dados necessários via serviços e retorna para `useLoaderData()`.

### Mutação `POST/PUT/PATCH/DELETE`: Use Action
- A Action roda quando você submete um `<Form method="post">` (ou `useSubmit`/`fetcher.submit`), lê `formData`, chama o serviço, e decide se redireciona ou retorna JSON.

### Serviços (cliente) ficam no meio do caminho
- Loader/Action não falam com a API diretamente, eles chamam funções de `src/services/**` (que usam `getJSON/postJson/patchJson)` e essas funções chamam os endpoints Express (`/api/public/*, /api/protected/*`).

