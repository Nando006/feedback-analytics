# UC-01: Cadastro de Conta Empresarial

| Campo | Valor |
|---|---|
| **Ator** | Empresa (novo cliente) |
| **Objetivo** | Criar uma conta e ativá-la para começar a usar o produto |
| **Gatilho** | Visitante clica em "Cadastrar" na landing page ou na tela de login |

---

## Fluxo Principal (Caminho Feliz)

1. O visitante acessa a tela de cadastro.
2. Preenche os dados: nome completo, e-mail, senha, documento (CPF ou CNPJ), telefone e aceite dos termos de uso.
3. Clica em "Criar conta".
4. O sistema valida os dados e cria a conta.
5. O sistema envia um e-mail de confirmação para o endereço informado.
6. O visitante abre o e-mail e clica no link de ativação.
7. O sistema redireciona para a tela de sucesso confirmando a ativação.
8. A conta está ativa e o gestor já pode fazer login.

---

## Exceções

| Situação | O que o sistema faz |
|---|---|
| E-mail já cadastrado na plataforma | O sistema segue normalmente para a tela de sucesso — não revela se o e-mail existe. O e-mail de confirmação não chegará. A tela de sucesso orienta o gestor sobre o que fazer caso isso aconteça (verificar spam, solicitar reenvio, esqueceu senha, ir para login) |
| Documento inválido (CPF ou CNPJ não passa na validação matemática) | Rejeita o cadastro e informa que o documento é inválido |
| Telefone fora do padrão brasileiro | Rejeita o campo e informa o formato esperado |
| Termos de uso não aceitos | Impede o envio do formulário |
| E-mail de confirmação não chegou | O gestor pode solicitar o reenvio do e-mail de ativação |
| Link de confirmação expirado | O sistema orienta o gestor a solicitar um novo e-mail de ativação |

---

## Base para Teste E2E

> Nenhum arquivo de teste é criado aqui.
> Quando o E2E for implementado, cada item abaixo vira um `it()`.

**Cenários a cobrir:**

- **Caminho feliz:** preencher todos os campos válidos, enviar, receber e-mail de confirmação e ativar a conta pelo link.
- **Exceção — e-mail duplicado:** tentar cadastrar com e-mail já existente deve seguir para a tela de sucesso normalmente, sem revelar que o e-mail já está em uso. O e-mail de confirmação não chegará e a tela de sucesso deve exibir orientação para esse caso.
- **Exceção — documento inválido:** inserir CPF ou CNPJ inválido (que não passa no cálculo matemático) deve bloquear o envio.
- **Exceção — telefone inválido:** inserir telefone fora do padrão BR deve bloquear o campo.
- **Exceção — termos não aceitos:** tentar enviar sem marcar os termos deve impedir o cadastro.
- **Exceção — reenvio de e-mail:** solicitar reenvio do e-mail de confirmação deve funcionar e exibir confirmação de envio.
