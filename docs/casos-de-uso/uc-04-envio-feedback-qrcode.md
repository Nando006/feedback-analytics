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
   - Nota global da experiência (1–5)
   - Comentário escrito
   - Respostas às perguntas dinâmicas
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
| Nota global não selecionada | Bloqueia o envio e exibe mensagem "Por favor, selecione uma avaliação" |
| Comentário não preenchido | Bloqueia o envio e exibe mensagem "Por favor, escreva seu feedback" |
| Perguntas dinâmicas não respondidas | Bloqueia o envio e exibe mensagem solicitando que todas as perguntas sejam respondidas |
| Subperguntas não respondidas | Bloqueia o envio e exibe mensagem solicitando que todas as subperguntas sejam respondidas |
| Dispositivo já enviou feedback para este ponto de coleta hoje | O sistema aceita o envio mas retorna o estado de "já enviado" — exibe tela informando que o feedback já foi registrado e agradece |
| Falha de rede ou erro do servidor ao enviar | Exibe toast de erro e mensagem inline no formulário — o cliente pode corrigir e tentar novamente |

---

## Base para Teste E2E

> Esta seção é documentação — nenhum arquivo de teste é criado aqui.
> Quando o E2E for implementado, cada item abaixo vira um `it()`.

**Cenários a cobrir:**

- **Caminho feliz:** cliente acessa URL válida, preenche nota, comentário, responde todas as perguntas dinâmicas e clica em "Enviar" — deve exibir a tela de agradecimento.
- **Exceção — empresa inválida:** acessar URL com identificador de empresa inexistente deve exibir a tela de erro fatal, sem renderizar o formulário.
- **Exceção — dispositivo duplicado:** segundo envio pelo mesmo dispositivo no mesmo dia e ponto de coleta deve exibir a tela de "feedback já registrado".
- **Exceção — nota não selecionada:** clicar em "Enviar" sem selecionar a nota deve bloquear o envio e exibir a mensagem de campo obrigatório.
- **Exceção — comentário vazio:** clicar em "Enviar" sem preencher o comentário deve bloquear o envio e exibir a mensagem de campo obrigatório.
- **Exceção — perguntas não respondidas:** clicar em "Enviar" sem responder todas as perguntas dinâmicas deve bloquear o envio com a mensagem correspondente.
