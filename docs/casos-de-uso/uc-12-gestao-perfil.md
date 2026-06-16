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

> Os testes E2E já estão implementados no Playwright ([uc-12-gestao-perfil.spec.ts](file:///C:/Users/Fernando/Repositorios/feedback-analytics/apps/web/e2e/uc-12-gestao-perfil.spec.ts)).
> Cada cenário abaixo possui a sua respectiva classificação e estratégia de execução mapeada no [Plano de Teste Estratégico](../testes/plano-estrategico.md).

**Cenários a cobrir:**

- **[CT-UC12-01]** ✅ *Coberto E2E* - Carregamento: a página de perfil carrega com os dados da empresa (perfil/empresa/nome/e-mail). (Spec: `[CT-UC12-01] Página de perfil carrega com dados da empresa`.)
- **[CT-UC12-02]** ✅ *Coberto E2E* - E-mail exibido: o e-mail do usuário autenticado é exibido no perfil. (Spec: `[CT-UC12-02] E-mail do usuário autenticado é exibido no perfil`.)
- **[CT-UC12-03]** ✅ *Coberto E2E (skip condicional)* - Link para QR Code: o link para o QR Code da empresa está presente no perfil e navega para `/user/qrcode/enterprise`. Contém `test.skip()` quando o link não está visível. (Spec: `[CT-UC12-03] Link para QR Code da empresa está presente no perfil`.)
- **[CT-UC12-04]** ✅ *Coberto E2E (skip condicional)* - Link para catálogo: o link para a configuração do catálogo está presente no perfil e navega para a rota de edição. Contém `test.skip()` quando o link não está visível. (Spec: `[CT-UC12-04] Link para configuração do catálogo está presente no perfil`.)
- **[CT-UC12-06]** ✅ *Coberto E2E* - Logout: o logout redireciona para a página de login. (Spec: `[CT-UC12-06] Logout redireciona para página de login`.)
- **[CT-UC12-07]** ✅ *Coberto E2E* - Rota protegida: usuário não autenticado é redirecionado para o login ao acessar rota protegida. (Spec: `[CT-UC12-07] Usuário não autenticado é redirecionado para login ao acessar rota protegida`.)
- **[CT-UC12-08]** 📝 *Planejado / não implementado* - Caminho feliz — nome: gestor edita o nome, salva e confirma que o novo nome aparece no perfil.
- **[CT-UC12-09]** 📝 *Planejado / não implementado* - Caminho feliz — e-mail: gestor informa novo e-mail válido e recebe a mensagem de sucesso (a confirmação nos dois e-mails é feita fora do app).
- **[CT-UC12-10]** 📝 *Planejado / não implementado* - Caminho feliz — telefone: gestor informa novo número, recebe o SMS, insere o código de 6 dígitos e o telefone é atualizado.
- **[CT-UC12-11]** 📝 *Planejado / não implementado* - Caminho feliz — cancelar telefone: durante o modo de edição ou verificação, clicar em "Cancelar" deve voltar ao modo de visualização sem alterar o número.
- **[CT-UC12-12]** 🔵 *Unidade já atende* - Exceção — nome vazio: tentar salvar com campo de nome vazio deve bloquear o envio.
- **[CT-UC12-13]** 🔵 *Unidade já atende* - Exceção — telefone inválido: informar número fora do padrão `+55 DDD NÚMERO` deve bloquear o formulário antes de enviar o SMS.
- **[CT-UC12-14]** 📝 *Planejado / não implementado* - Exceção — código inválido: inserir código errado na verificação deve exibir toast de erro sem sair do modo de verificação.
