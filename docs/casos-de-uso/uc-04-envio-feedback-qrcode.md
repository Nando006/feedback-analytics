# UC-04: Envio de Feedback via QR Code

| Campo | Valor |
|---|---|
| **Ator** | Cliente do estabelecimento |
| **Objetivo** | Enviar uma avaliação sobre a experiência com a empresa, produto, serviço ou departamento |
| **Gatilho** | Cliente escaneia o QR Code disponibilizado pela empresa |

---

## Fluxo Principal (Caminho Feliz)

1. O cliente escaneia o QR Code e o navegador abre a URL do formulário.
2. O sistema lê os parâmetros da URL: identificador da empresa, ponto de coleta e item do catálogo (quando aplicável).
3. O sistema valida se a empresa existe e está ativa via API.
4. O formulário é carregado com as perguntas configuradas pela empresa.
5. O cliente preenche os campos obrigatórios:
   - Respostas às perguntas de avaliação configuradas pela empresa, cada uma com escala Likert: **Péssimo / Ruim / Mediana / Boa / Ótima**
   - Comentário escrito
   - Respostas às subperguntas (quando presentes)
6. Opcionalmente, o cliente informa seus dados pessoais: nome, e-mail e gênero.
7. O cliente clica em "Enviar".
8. O sistema valida todos os campos obrigatórios antes de enviar.
9. O sistema registra o feedback e exibe a tela de agradecimento.

---

## Exceções

| Situação | O que o sistema faz |
|---|---|
| Identificador da empresa ausente na URL | Exibe tela de erro fatal — o formulário não é carregado |
| Empresa não encontrada, inativa ou item do catálogo inativo | Exibe tela de erro fatal — o formulário não é carregado |
| Perguntas dinâmicas não configuradas para este QR Code | Bloqueia o envio e exibe mensagem no formulário orientando o cliente |
| Perguntas de avaliação não respondidas | Bloqueia o envio e exibe mensagem "Responda as X perguntas antes de enviar" |
| Comentário não preenchido | Bloqueia o envio e exibe mensagem "Por favor, escreva seu feedback" |
| Subperguntas não respondidas | Bloqueia o envio e exibe mensagem solicitando que todas as subperguntas sejam respondidas |
| Dispositivo já enviou feedback para este ponto de coleta hoje | O sistema aceita o envio mas retorna o estado de "já enviado" — exibe tela informando que o feedback já foi registrado e agradece |
| Falha de rede ou erro do servidor ao enviar | Exibe toast de erro e mensagem inline no formulário — o cliente pode corrigir e tentar novamente |

---

## Base para Teste E2E

> Esta seção é documentação — nenhum arquivo de teste é criado aqui.
> Quando o E2E for implementado, cada item abaixo vira um `it()`.
> Execução formal: [plano-estrategico.md](../testes/plano-estrategico.md) — Fase 2, UC-04.

**Cenários a cobrir:**

- **[CT-UC04-01]** Caminho feliz: cliente acessa URL válida, seleciona a opção Likert (ex.: "Ótima") em cada pergunta, preenche o comentário e clica em "Enviar" — deve exibir a tela de agradecimento.
- **[CT-UC04-02]** Exceção — dispositivo duplicado: segundo envio pelo mesmo dispositivo no mesmo dia deve exibir a tela de "feedback já registrado".
- **[CT-UC04-03]** Exceção — empresa inválida: acessar URL com identificador de empresa inexistente deve exibir a tela de erro fatal, sem renderizar o formulário.
- **[CT-UC04-04]** Exceção — perguntas não respondidas: clicar em "Enviar" sem selecionar opção Likert em nenhuma pergunta deve bloquear o envio e exibir a mensagem "Responda as X perguntas antes de enviar".
- **[CT-UC04-05]** Exceção — parâmetro enterprise ausente: acessar `/feedback/qrcode` sem o parâmetro `enterprise` na URL deve exibir tela de erro fatal.
- **[CT-UC04-06]** Campos opcionais de identificação (nome, e-mail, gênero) são preenchíveis sem bloquear o envio.
