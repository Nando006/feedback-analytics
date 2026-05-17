# UC-12: Gestão de Perfil

| Campo | Valor |
|---|---|
| **Ator** | Gestor |
| **Objetivo** | Atualizar os dados pessoais e de contato da conta |
| **Gatilho** | Gestor acessa a tela de perfil no dashboard |

---

## Visão Geral da Tela

A tela de perfil concentra quatro seções:

1. **Informações pessoais** — nome, e-mail e telefone (este UC).
2. **QR Code da Empresa** — atalho direto para a página de geração e compartilhamento de QR Code (UC-05).
3. **Configuração de Coleta (IA)** — formulário de contexto do negócio em acordeão (UC-08).
4. **Perguntas Dinâmicas da Empresa** — configuração das 3 perguntas gerais do tipo Empresa, com até 3 subperguntas cada (20–150 caracteres, toggle ativo/inativo por pergunta e subpergunta).

---

## Fluxo Principal (Caminho Feliz)

**Atualizar nome:**

1. O gestor clica no campo de nome e edita o valor.
2. Confirma a alteração.
3. O sistema valida que o nome não está vazio e salva.
4. O nome atualizado aparece imediatamente no perfil.

**Atualizar e-mail:**

1. O gestor clica no campo de e-mail e informa o novo endereço.
2. Confirma a alteração.
3. O sistema envia uma solicitação de confirmação para **os dois endereços** — o antigo e o novo.
4. O gestor confirma em ambos os e-mails para que a alteração seja efetivada.

**Atualizar telefone (dois passos):**

1. O gestor clica no campo de telefone — a tela muda para o modo de edição.
2. Informa o novo número no formato `+55 DDD NÚMERO` e clica em "Enviar SMS".
3. O sistema envia o código de verificação de 6 dígitos por SMS.
4. A tela muda para o modo de verificação.
5. O gestor digita o código recebido e clica em "Confirmar".
6. O telefone é atualizado na conta e a tela volta ao modo de visualização.
7. O gestor pode cancelar a qualquer momento (modo edição ou verificação) para voltar ao valor anterior sem alterar nada.

---

## Exceções

| Situação | O que o sistema faz |
|---|---|
| Nome vazio ao salvar | Rejeita o envio — o campo é obrigatório |
| Código de verificação do telefone inválido | Exibe toast de erro "Código inválido" — o gestor pode tentar novamente |
| Erro ao enviar o SMS | Exibe toast de erro "Erro ao enviar código" com mensagem de detalhes |
| Telefone fora do padrão (`+55 DDD NÚMERO`) | A validação do formulário bloqueia o envio antes de chamar a API |
| Erro de rede ao salvar nome ou e-mail | Exibe toast de erro — o valor anterior permanece no campo |

---

## Base para Teste E2E

> Esta seção é documentação — nenhum arquivo de teste é criado aqui.
> Quando o E2E for implementado, cada item abaixo vira um `it()`.
> Execução formal: [plano-estrategico.md](../testes/plano-estrategico.md) — Fase 2, UC-12.

**Cenários a cobrir:**

- **[CT-UC12-01]** Caminho feliz — nome: gestor edita o nome, salva e confirma que o novo nome aparece no perfil.
- **[CT-UC12-02]** Caminho feliz — e-mail: gestor informa novo e-mail válido e recebe a mensagem de sucesso (a confirmação nos dois e-mails é feita fora do app).
- **[CT-UC12-03]** Caminho feliz — telefone: gestor informa novo número, recebe o SMS, insere o código de 6 dígitos e o telefone é atualizado.
- **[CT-UC12-04]** Caminho feliz — cancelar telefone: durante o modo de edição ou verificação, clicar em "Cancelar" deve voltar ao modo de visualização sem alterar o número.
- **[CT-UC12-05]** Exceção — nome vazio: tentar salvar com campo de nome vazio deve bloquear o envio.
- **[CT-UC12-06]** Exceção — telefone inválido: informar número fora do padrão `+55 DDD NÚMERO` deve bloquear o formulário antes de enviar o SMS.
- **[CT-UC12-07]** Exceção — código inválido: inserir código errado na verificação deve exibir toast de erro sem sair do modo de verificação.
