# UC-06: Ativação de Tipos de Feedback

| Campo | Valor |
|---|---|
| **Ator** | Gestor |
| **Objetivo** | Definir quais categorias de coleta a empresa utiliza: produtos, serviços ou departamentos |
| **Gatilho** | Gestor acessa a tela de tipos de feedback no dashboard |

---

## Fluxo Principal (Caminho Feliz)

1. O gestor acessa a tela de tipos de feedback.
2. O sistema exibe os 3 tipos gerenciáveis: **Produtos**, **Serviços** e **Departamentos**, com o status salvo de cada um. O tipo **Empresa (Geral)** está sempre disponível e não aparece aqui.
3. O gestor ativa ou desativa os tipos usando os toggles. Ao ativar um tipo ainda não salvo, a interface exibe um aviso: *"Salve para confirmar a ativação e liberar as configurações deste tipo."*
4. O gestor clica em "Salvar Alterações".
5. O sistema confirma com toast de sucesso.
6. Os tipos salvos como ativos passam a exibir o badge **"Ativo"** e o link de configuração de catálogo diretamente no card, na mesma tela.

---

## Exceções

| Situação | O que o sistema faz |
|---|---|
| Gestor ativa um toggle mas não salva | O toggle muda visualmente, mas o tipo não está ativo — o badge "Ativo" e o link de catálogo não aparecem até o salvamento |
| Erro ao salvar as configurações | Exibe toast de erro — o estado salvo não é alterado |
| Gestor desativa um tipo que já tem itens de catálogo cadastrados | Desativar não exclui os itens — apenas oculta o tipo da interface e bloqueia novos envios via QR Code |

---

## Base para Teste E2E

> Esta seção é documentação — nenhum arquivo de teste é criado aqui.
> Quando o E2E for implementado, cada item abaixo vira um `it()`.
> Execução formal: [plano-estrategico.md](../testes/plano-estrategico.md) — Fase 2, UC-06.

**Cenários a cobrir:**

- **[CT-UC06-01]** Caminho feliz — ativar: gestor ativa o tipo "Produtos", salva e verifica que o badge "Ativo" e o link "Configurar catálogo de produtos" aparecem no card.
- **[CT-UC06-02]** Caminho feliz — desativar: gestor desativa um tipo ativo, salva e verifica que o badge e o link de catálogo desaparecem.
- **[CT-UC06-03]** Comportamento antes de salvar: ativar um toggle sem salvar deve exibir o aviso em âmbar, sem mostrar o badge "Ativo" ou o link de catálogo.
- **[CT-UC06-04]** Exceção — erro ao salvar: simular falha de rede durante o salvamento deve exibir toast de erro sem alterar o estado salvo dos tipos.
