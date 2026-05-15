# Testes — Frontend (`apps/web`)

## Pirâmide de Testes

```
        ╔══════════╗
        ║   E2E    ║  ← não existe ainda — simularia a jornada real do usuário no navegador
        ╚══════════╝
     ╔════════════════╗
     ║  Integração    ║  ← actions e loaders — testa contratos entre módulos
     ╚════════════════╝
  ╔══════════════════════╗
  ║      Unidade         ║  ← utils e componentes React — testa funções e renders isolados
  ╚══════════════════════╝
```

---

## Cobertura de Testes (Vitest Coverage)

### O que é e por que usamos

**Vitest Coverage** é a ferramenta de cobertura nativa do Vitest, alimentada pelo motor **V8** (o mesmo motor JavaScript do Node.js e do Chrome). Ela instrumenta o código em tempo de execução e rastreia quais linhas, funções e branches foram executados durante os testes.

Usamos coverage no projeto por uma razão objetiva: **evitar que a documentação minta**. Qualquer número de cobertura escrito à mão em um doc envelhece e vira desinformação. Com `npm run test:coverage`, os números são sempre gerados a partir do código real no momento em que o comando é rodado.

### Como rodar

```bash
cd apps/web && npm run test:coverage
```

O relatório é gerado em dois formatos:
- **Terminal** — tabela imediata com percentuais por arquivo
- **HTML** — relatório visual detalhado em `apps/web/coverage/index.html` — mostra linha a linha o que foi ou não coberto

### Como interpretar as métricas

| Métrica | O que mede |
|---|---|
| **% Stmts** (statements) | Percentual de instruções executadas — é a métrica mais fiel ao que realmente rodou |
| **% Branch** | Percentual de ramificações cobertas — cada `if/else`, ternário e `&&` conta como dois caminhos |
| **% Funcs** | Percentual de funções que foram chamadas pelo menos uma vez nos testes |
| **% Lines** | Percentual de linhas executadas — equivale a Stmts na maioria dos casos |

> A métrica mais importante é **% Branch** — uma função pode ter 100% de linhas cobertas mas deixar metade dos caminhos condicionais sem teste.

### Snapshot atual

Rodado em 2026-05-15. Para ver números atualizados, execute `npm run test:coverage`.

| Área | % Stmts | % Branch | % Funcs |
|---|---|---|---|
| `src/lib/utils` | 64,73% | 80,92% | **97,29%** |
| `src/routes/actions` | 43,51% | 50,87% | 75,00% |
| `src/routes/load` | 18,93% | 55,00% | 55,55% |
| `pages` (login, register) | **100%** | **100%** | **100%** |
| `pages` (demais) | 0–93% | 0–66% | 0–100% |
| `layouts` | 52,17% | 64,78% | 15,38% |
| **Total geral** | **33,43%** | **62,10%** | **64,39%** |

O número total baixo (33% de statements) reflete que boa parte das páginas e loaders ainda não tem testes — o que é esperado para o estágio atual do projeto. A cobertura de **funções dos utilitários está em 97%**, que é a camada mais crítica de testar.

---

## Visão do Domínio

O frontend concentra a maior parte da cobertura de testes do projeto. Os testes estão distribuídos em três camadas que correspondem à estrutura de pastas do próprio código.

```
apps/web/
├── src/lib/utils/tests/     ← unitários (funções puras)
├── src/routes/actions/      ← integração (actions do React Router)
├── src/routes/load/         ← integração (loaders do React Router)
├── pages/tests/             ← componentes (páginas)
├── layouts/tests/           ← componentes (layouts)
└── tests/setup.ts           ← setup global compartilhado
```

**Framework:** Vitest com ambiente jsdom  
**Config:** `apps/web/vite.config.ts`

```bash
# Rodar os testes do frontend
cd apps/web && npx vitest

# Execução única (CI)
cd apps/web && npx vitest run
```

---

## Setup Global (`tests/setup.ts`)

Executado antes de cada arquivo de teste. Configura dois mocks obrigatórios para o ambiente jsdom:

| Mock | Por quê |
|---|---|
| `useRouteLoaderData` (react-router-dom) | jsdom não tem contexto de rota — sem o mock todos os componentes que usam esse hook quebram |
| `window.matchMedia` | jsdom não implementa a API de media queries — componentes responsivos que verificam breakpoints causariam erro |

---

## O Critério de Classificação

O que define se um teste é **unidade** ou **integração** não é o tipo de artefato sendo testado (função vs componente), mas sim **se ele cruza uma fronteira real entre módulos**.

| É unidade quando... | É integração quando... |
|---|---|
| Todos os colaboradores externos são substituídos por mocks | O fluxo passa por dois ou mais módulos reais sem mocks no meio |
| O teste verifica o comportamento de uma única peça isolada | O teste verifica o contrato entre peças — o que entra em uma deve sair corretamente na outra |
| Uma falha aponta diretamente para aquele artefato | Uma falha pode estar na fronteira entre os módulos |

**Por isso, neste projeto:**

- **Funções utilitárias** → unidade. Não dependem de nada externo, testadas com entrada e saída direta.
- **Componentes React** → unidade. Todos os filhos são mockados com `vi.mock`. O componente é a única peça real em execução.
- **Actions e Loaders** → integração. O `FormData` entra no handler, que transforma os dados e chama o serviço — dois módulos reais cruzando fronteira, mesmo que o HTTP seja mockado no final.

---

## Camada 1 — Unidade

Testam código em isolamento total — funções puras e componentes React com todos os filhos mockados. Nenhum módulo real externo é envolvido. São os testes mais rápidos e de menor custo de manutenção.

### Funções puras (`src/lib/utils/tests/`)

### Formatação de Documentos

**`formatDocument.test.ts`** e **`formatDocumentInput.test.ts`**

Formatação de CPF e CNPJ — tanto o display estático quanto a formatação progressiva durante a digitação.

```
'12345678900'   → '123.456.789-00'    (CPF)
'12345678000199' → '12.345.678/0001-99' (CNPJ)
''               → ''                  (vazio)
tipo desconhecido → retorna só os dígitos
```

---

### Filtro de Dígitos — `digitsOnly.test.ts`

Remove qualquer caractere não-numérico de uma string. Usado como preprocessador antes dos formatadores de CPF, CNPJ e telefone.

---

### Formatação de Telefone

**`formatPhoneInputBR.test.ts`** e **`formtPhone.test.ts`**

Telefone brasileiro no padrão `(DD) XXXXX-XXXX` — um para formatação progressiva em input, outro para exibição estática.

---

### Força de Senha — `passwordStrength.test.ts`

A função `getPasswordStrength` retorna `{ showBar, percent, label, color }` com base na complexidade.

| Senha de entrada | `percent` | `label` | `color` |
|---|---|---|---|
| `''` (vazia) | 0 | Muito fraca | — |
| `'abc'` (curta, só minúsculas) | 25 | Fraca | `bg-red-500` |
| `'Abcdef1!'` (complexa) | 100 | Muito forte | `bg-purple-600` |

---

### Mapeamento de Sentimento — `sentiment.test.ts`

Converte os valores internos da API para labels em português exibidos na interface.

```
'positive' → 'Positivo'
'neutral'  → 'Neutro'
'negative' → 'Negativo'
```

---

### Truncamento de Texto — `truncateText.test.ts`

Corta strings longas adicionando reticências. Usado em componentes de listagem onde o espaço é limitado.

---

### Formulário de Feedback via QR Code

Quatro arquivos que cobrem aspectos diferentes do mesmo fluxo público (sem autenticação):

#### `publicQrFeedbackValidation.test.ts`

Valida o payload antes do envio ao servidor.

| Campo ausente | Erro retornado |
|---|---|
| `enterprise_id` vazio | `missingEnterpriseId` |
| `rating` igual a zero | `missingRating` |
| `message` só com espaços | `missingMessage` |
| Tudo preenchido | `null` (sem erro) |

Também testa o parsing de respostas dinâmicas:
- `answer_value` é **normalizado para uppercase** (`'boa'` → `'BOA'`)
- Subanswers com IDs duplicados retornam `null` (rejeitados)
- Campo de subanswers vazio retorna `[]` (permitido)

#### `publicQrFeedbackForm.test.ts`

Funções que gerenciam o estado do formulário multi-etapa:

| Função | O que verifica |
|---|---|
| `filterAnswersForQuestions` | Remove respostas de perguntas fora do contexto atual |
| `filterSubanswersForQuestions` | Remove subrespostas de subperguntas inativas |
| `hasAllRequiredAnswers` | Valida se todas as perguntas obrigatórias foram respondidas |
| `hasAllRequiredSubanswers` | Valida subrespostas obrigatórias |
| `orderAnswersByQuestions` | Ordena respostas pela `question_order` configurada |
| `orderSubanswersByQuestions` | Ordena subrespostas pela `subquestion_order` |
| `getActiveSubquestions` | Retorna só subperguntas com `is_active: true`, ordenadas |
| `getItemKindLabel` | `'PRODUCT'` → `'Produto'`, `'SERVICE'` → `'Serviço'`… |

#### `publicQrFeedbackErrorMessage.test.ts`

Mensagens de erro exibidas ao usuário para cada código de falha de validação.

#### `publicQrFeedbackTemplateEngine.test.ts`

Motor de templates que personaliza textos de perguntas dinâmicas (ex: substituição de variáveis como `{{nome_empresa}}`).

---

### Componentes e Páginas (`pages/tests/`, `layouts/tests/`)

Testam renderização e estrutura visual usando **React Testing Library** + **jsdom**. Componentes filhos são mockados com `vi.mock` — o componente sendo testado é a unidade, sem dependências reais.

#### Padrão de Isolamento

```tsx
// Mock dos filhos — foco só na página sendo testada
vi.mock('components/public/forms/formLogin', () => ({
  default: () => <div data-testid="form-login">Login Form</div>,
}));

describe('Login Page', () => {
  it('deve renderizar o formulário de login', () => {
    render(<Login />);
    expect(screen.getByTestId('form-login')).toBeInTheDocument();
  });
});
```

#### Páginas — `pages/tests/`

| Arquivo | O que verifica |
|---|---|
| `login.test.tsx` | Título "Bem-vindo de volta", formulário, ícone, link `/register`, links de Termos e Privacidade, classes CSS de layout, elementos decorativos |
| `register.test.tsx` | Fluxo de cadastro — título, formulário de criação de conta, link de retorno ao login |
| `home.test.tsx` | Página inicial pós-autenticação — boas-vindas e navegação |
| `dashboard.test.tsx` | Estrutura do painel — métricas, gráficos e filtros com dados mockados |
| `profile.test.tsx` | Perfil do usuário — campos de dados pessoais e seções de configuração |

#### Layout — `layouts/tests/`

| Arquivo | O que verifica |
|---|---|
| `userLayout.test.tsx` | Wrapper de páginas autenticadas — sidebar, header, slot de conteúdo renderizando filhos |

#### Seletores Usados

| Seletor | Quando usar |
|---|---|
| `screen.getByTestId('id')` | Elemento com `data-testid` — preferido para estrutura |
| `screen.getByText('texto')` | Texto visível ao usuário — preferido para conteúdo |
| `screen.getByRole('button')` | Elementos semânticos — preferido para acessibilidade |
| `container.querySelector('.classe')` | Apenas quando testamos classes de estilo |

---

## Camada 2 — Integração

Actions e Loaders são os handlers de dados do React Router v6. Ficam entre componentes e serviços HTTP — recebem um `Request`, processam e retornam dados.

Aqui está a integração real: o teste cruza a fronteira entre o formulário, o handler e o serviço — verificando o contrato entre esses módulos. O serviço HTTP é mockado, mas o fluxo de dados entre as camadas é real.

### Como o Request é Simulado

```ts
function createRequest(body: Record<string, string | undefined>) {
  const formData = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => {
    if (typeof value !== 'undefined') formData.append(key, value);
  });

  return new Request('http://localhost/user/edit/rota', {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  });
}
```

### `actionCollectingData.test.ts`

Salva configurações de coleta da empresa (produtos, serviços, departamentos, perguntas).

| Caso | Comportamento verificado |
|---|---|
| `uses_company_products = 'on'` | Envia lista de produtos parseada |
| `uses_company_products = 'false'` | Envia arrays vazios |
| `catalog_products` JSON presente | Prioriza catálogo estruturado sobre campo legado `main_products_or_services` |
| Subperguntas com estrutura 3x3 | Preserva hierarquia perguntas → subperguntas |
| Campos de catálogo ausentes | **Não sobrescreve** dados existentes |

### `actionFeedbackSettings.test.ts`

Gerencia múltiplas sub-ações via campo `intent`.

| `intent` | Resposta esperada |
|---|---|
| Valor inválido | `{ error: 'Ação inválida.' }` — serviço não é chamado |
| `save_company_feedback_questions` (válida) | `{ ok: true, scope: 'COMPANY', message: '...' }` |
| `save_company_feedback_questions` (texto curto) | `{ error: 'Perguntas da empresa inválidas...' }` |
| `save_products_catalog` | `{ ok: true, scope: 'PRODUCT', message: '...' }` |
| `save_services_catalog` (JSON inválido) | `{ error: 'Itens de catálogo inválidos.' }` |

### `actionPublicQrCodeFeedback.test.ts`

Envio de feedback via QR Code público (sem autenticação). Cobre validação de payload, envio correto com respostas dinâmicas e tratamento de erros.

### `loadPublicQrCodeEnterprise.test.ts`

Loader que busca dados da empresa para a página pública de QR Code.

| Cenário | Resultado |
|---|---|
| Empresa encontrada | Retorna perguntas ativas e configurações de exibição |
| `enterprise_id` inválido | Lança erro → redireciona para página de erro |
| Serviço indisponível | Propaga o erro corretamente |

---

## Veja Também

- [Visão Geral dos Testes](./visao-geral.md)
- [Microserviço IA](./ia-analyze.md)
- [Backend](./api-gateway.md)
