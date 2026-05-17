# UC-07: Configuração do Catálogo

| Campo | Valor |
|---|---|
| **Ator** | Gestor |
| **Objetivo** | Cadastrar itens de catálogo (produtos, serviços ou departamentos), configurar as perguntas dinâmicas de cada item e controlar o QR Code individual por item |
| **Gatilho** | Gestor acessa a tela de configuração de catálogo de um dos tipos ativados |

---

## Fluxo Principal (Caminho Feliz)

### Parte 1 — Gerenciar itens do catálogo

1. O gestor acessa a tela de catálogo (produtos, serviços ou departamentos).
2. O sistema exibe os itens cadastrados, cada um com seu nome e status (ativo ou inativo).
3. O gestor adiciona, edita ou remove itens pelo formulário principal.
4. O gestor clica em "Salvar".
5. O sistema confirma com notificação de sucesso e a lista é atualizada.
   - **Efeito colateral:** ao salvar o catálogo de produtos, o sistema atualiza automaticamente o campo de contexto de IA (`main_products_or_services`) com os itens cadastrados.

### Parte 2 — Configurar perguntas dinâmicas por item

6. Para cada item do catálogo, o gestor pode configurar perguntas dinâmicas independentes (entre 20 e 150 caracteres, incluindo subperguntas).
7. O gestor clica em "Salvar perguntas" no card do item — esta é uma ação separada do salvamento do catálogo.
8. O sistema confirma com notificação de sucesso para aquele item.

### Parte 3 — Controlar o QR Code por item

9. Cada item do catálogo tem um toggle independente de QR Code (ativo ou inativo).
10. O gestor ativa ou desativa o QR Code de um item pelo toggle.
11. O sistema confirma a mudança imediatamente com toast de sucesso — sem necessidade de salvar o formulário principal.

---

## Exceções

| Situação | O que o sistema faz |
|---|---|
| Pergunta com texto abaixo de 20 ou acima de 150 caracteres | Rejeita o salvamento das perguntas daquele item e indica o campo com erro |
| Subpergunta com texto fora do intervalo (20–150 caracteres) | Mesma validação aplicada às subperguntas |
| Tentativa de acessar catálogo de tipo não ativado | A rota não está acessível — o gestor precisa ativar o tipo no UC-06 primeiro |
| Erro ao salvar o catálogo (itens) | Exibe notificação de erro — os dados anteriores não são alterados |
| Erro ao salvar as perguntas de um item | Exibe notificação de erro para aquele item — outros itens não são afetados |
| Erro ao ativar ou desativar o QR Code de um item | Exibe toast de erro — o estado do toggle não é alterado |
| Gestor desativa um item do catálogo (status inativo) | O formulário público exibe tela de erro fatal para aquele item — novos envios são bloqueados sem excluir o histórico |
| Gestor desativa o QR Code de um item (toggle) | O formulário público daquele item bloqueia novos envios, igual ao estado de item inativo |

---

## Base para Teste E2E

> Esta seção é documentação — nenhum arquivo de teste é criado aqui.
> Quando o E2E for implementado, cada item abaixo vira um `it()`.
> Execução formal: [plano-estrategico.md](../testes/plano-estrategico.md) — Fase 2, UC-07.

**Cenários a cobrir:**

- **[CT-UC07-01]** Caminho feliz — adicionar item: gestor adiciona um produto com nome válido, salva e confirma que o item aparece na lista com status ativo.
- **[CT-UC07-02]** Caminho feliz — editar item: gestor edita o nome de um produto existente, salva e confirma a atualização.
- **[CT-UC07-03]** Caminho feliz — salvar perguntas: gestor configura uma pergunta dinâmica válida (20–150 chars) em um item, clica em "Salvar perguntas" e recebe confirmação de sucesso.
- **[CT-UC07-04]** Caminho feliz — toggle QR Code por item: gestor ativa ou desativa o QR Code de um item via toggle — deve exibir toast de sucesso e atualizar o estado visualmente sem necessidade de salvar o catálogo.
- **[CT-UC07-05]** Exceção — pergunta inválida (curta): tentar salvar pergunta com menos de 20 caracteres deve bloquear o envio e destacar o campo com erro.
- **[CT-UC07-06]** Exceção — pergunta inválida (longa): tentar salvar pergunta com mais de 150 caracteres deve bloquear o envio.
- **[CT-UC07-07]** Exceção — item inativo: desativar um produto e verificar que o formulário público daquele item exibe tela de erro fatal.
- **[CT-UC07-08]** Exceção — QR Code desativado por item: desativar o QR Code de um item via toggle e verificar que o formulário público bloqueia novos envios para aquele item.
