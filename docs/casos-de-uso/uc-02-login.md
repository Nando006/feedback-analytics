# UC-02: Login da Empresa

| Campo | Valor |
|---|---|
| **Ator** | Gestor |
| **Objetivo** | Autenticar-se e acessar o dashboard da empresa |
| **Gatilho** | Gestor acessa a tela de login |

---

## Fluxo Principal (Caminho Feliz)

1. O gestor acessa a tela de login.
2. Preenche e-mail e senha.
3. Clica em "Entrar".
4. O sistema valida as credenciais.
5. A sessão é criada e o gestor é redirecionado para o dashboard.

---

## Exceções

| Situação | O que o sistema faz |
|---|---|
| Credenciais inválidas (e-mail ou senha errados) | Exibe mensagem de erro sem revelar qual campo está incorreto |
| Muitas tentativas seguidas (rate limit) | Bloqueia temporariamente e exibe mensagem pedindo para aguardar antes de tentar novamente |
| Servidor de autenticação indisponível | Exibe mensagem informando que o serviço está temporariamente indisponível |
| Sem conexão com a internet | Exibe mensagem pedindo para verificar a conexão |
| Conta não ativada (e-mail não confirmado) | Exibe mensagem orientando o gestor a confirmar o e-mail e oferece opção de reenvio |

---

## Base para Teste E2E

> Esta seção é documentação — nenhum arquivo de teste é criado aqui.
> Quando o E2E for implementado, cada item abaixo vira um `it()`.
> Execução formal: [plano-estrategico.md](../testes/plano-estrategico.md) — Fase 2, UC-02.

**Cenários a cobrir:**

- **[CT-UC02-01]** Caminho feliz: gestor insere credenciais válidas, clica em "Entrar" e é redirecionado para o dashboard.
- **[CT-UC02-02]** Exceção — credenciais inválidas: inserir senha errada deve exibir mensagem de erro sem redirecionar.
- **[CT-UC02-03]** Exceção — rate limit: após múltiplas tentativas incorretas, deve exibir mensagem de bloqueio temporário.
- **[CT-UC02-04]** Exceção — campos vazios: tentar enviar o formulário sem preencher os campos deve destacá-los como obrigatórios.
