# UC-08: Configuração de Dados de Coleta (Contexto IA)

| Campo | Valor |
|---|---|
| **Ator** | Gestor |
| **Objetivo** | Preencher as informações do negócio que a IA usa para gerar insights relevantes e personalizados |
| **Gatilho** | Gestor acessa a tela de configuração de dados de coleta |

---

## Fluxo Principal (Caminho Feliz)

1. O gestor acessa a tela de dados de coleta da empresa.
2. O sistema exibe os campos de contexto já preenchidos (ou em branco, se for o primeiro acesso).
3. O gestor preenche ou atualiza os três campos de contexto:
   - **Objetivo da Empresa** — foco atual do negócio para a IA filtrar feedbacks
   - **Objetivo Analítico** — o que a IA deve investigar nos feedbacks
   - **Resumo do Negócio** — descrição do que a empresa faz e para quem
4. O gestor clica em "Salvar Alterações".
5. O sistema confirma com toast de sucesso.

> **Nota:** os campos não são obrigatórios — podem ser salvos em branco. A IA usará o que estiver preenchido no momento da análise.

---

## Exceções

| Situação | O que o sistema faz |
|---|---|
| Erro de rede ao salvar | Exibe toast de erro — os dados do formulário permanecem para nova tentativa |
| Gestor tenta disparar análise de IA sem ter preenchido os dados de coleta | A análise é bloqueada no UC-11 com a mensagem orientando o gestor a preencher os dados de coleta aqui |

---

## Informações Complementares

- Os campos exibem um contador de caracteres informativo (sem limite máximo imposto pelo formulário).
- O campo **"Principais produtos ou serviços"**, visível no contexto de IA, é preenchido automaticamente ao salvar o catálogo de produtos no UC-07 — não é editado diretamente nesta tela.

---

## Base para Teste E2E

> Os testes E2E estão implementados no Playwright ([uc-08-configuracao-coleta-ia.spec.ts](file:///C:/Users/Fernando/Repositorios/feedback-analytics/apps/web/e2e/uc-08-configuracao-coleta-ia.spec.ts)). O spec contém um smoke de carregamento e dois testes de salvamento condicionais (com `test.skip()` quando o campo correspondente não está visível). Cada cenário abaixo possui a sua respectiva classificação e estratégia de execução mapeada no [Plano de Teste Estratégico](../testes/plano-estrategico.md).

**Cenários a cobrir:**

- **[CT-UC08-01]** ✅ *Coberto E2E (smoke)* - Carregamento: a página de configuração de coleta carrega com o formulário visível. (Spec: `[CT-UC08-01] Página de configuração de coleta carrega com formulário visível`.)
- **[CT-UC08-02]** ✅ *Coberto E2E (skip condicional)* - Caminho feliz — salvar objetivo: gestor preenche o objetivo da empresa, salva e recebe confirmação de sucesso. Contém `test.skip()` quando o campo de objetivo não está visível. (Spec: `[CT-UC08-02] Salvar objetivo da empresa persiste e exibe confirmação`.)
- **[CT-UC08-03]** 🔵 *Unidade já atende* - Caminho feliz — campos em branco: salvar com todos os campos vazios deve retornar sucesso sem exibir erro — campos vazios são permitidos.
- **[CT-UC08-04]** ✅ *Coberto E2E (skip condicional)* - Caminho feliz — salvar resumo do negócio: gestor preenche o resumo do negócio, salva e recebe confirmação de sucesso. Contém `test.skip()` quando o campo de resumo não está visível. (Spec: `[CT-UC08-04] Resumo do negócio pode ser preenchido e salvo`.)
- **[CT-UC08-05]** 🟠 *Integração já atende* - Caminho feliz — atualização parcial: gestor edita apenas o resumo do negócio, salva e confirma que os demais campos permanecem inalterados.
- **[CT-UC08-06]** ❌ *Cenário não coberto* - Exceção — erro ao salvar: simular falha de rede deve exibir toast de erro sem alterar os dados do formulário.
