# Visão Geral dos Casos de Uso

## O que é esta pasta

Cada arquivo desta pasta documenta um caso de uso do sistema — uma intenção de um ator que resulta em um valor concreto. A premissa central é:

> **Caso de Uso = Teste E2E**
>
> Os cenários da seção "Base para Teste E2E" de cada UC e mapeiam 1:1 para arquivos de teste TypeScript. Quando uma regra de negócio muda, toca-se apenas um arquivo de UC — o arquivo de teste correspondente segue a mesma estrutura.

---

## Índice

| UC | Nome | Ator | Objetivo |
|---|---|---|---|
| [UC-01](uc-01-cadastro-conta.md) | Cadastro de Conta Empresarial | Empresa | Criar conta e ativá-la via e-mail |
| [UC-02](uc-02-login.md) | Login da Empresa | Gestor | Autenticar e acessar o dashboard |
| [UC-03](uc-03-recuperacao-senha.md) | Recuperação de Senha | Gestor | Redefinir senha via link no e-mail |
| [UC-04](uc-04-envio-feedback-qrcode.md) | Envio de Feedback via QR Code | Cliente do estabelecimento | Enviar avaliação escaneando o QR Code |
| [UC-05](uc-05-geracao-qrcode.md) | Geração e Compartilhamento de QR Code | Gestor | Controlar e distribuir o QR Code |
| [UC-06](uc-06-ativacao-tipos-feedback.md) | Ativação de Tipos de Feedback | Gestor | Definir quais categorias a empresa coleta |
| [UC-07](uc-07-configuracao-catalogo.md) | Configuração do Catálogo | Gestor | Cadastrar itens e configurar QR Code por item |
| [UC-08](uc-08-configuracao-coleta-ia.md) | Configuração de Dados de Coleta (IA) | Gestor | Preencher contexto do negócio para a IA |
| [UC-09](uc-09-dashboard.md) | Visualização do Dashboard | Gestor | Visão geral e atualizada dos feedbacks |
| [UC-10](uc-10-listagem-feedbacks.md) | Listagem e Filtragem de Feedbacks | Gestor | Navegar, filtrar e detalhar feedbacks |
| [UC-11](uc-11-insights-ia.md) | Disparo e Visualização de Insights IA | Gestor | Gerar análise com IA e visualizar relatório |
| [UC-12](uc-12-gestao-perfil.md) | Gestão de Perfil | Gestor | Atualizar dados pessoais e de contato |

---

## Atores

| Ator | UCs | Papel |
|---|---|---|
| **Empresa** (novo cliente) | UC-01 | Realiza o cadastro inicial e ativa a conta |
| **Gestor** | UC-02 a UC-12 (exceto UC-04) | Opera o dashboard, configura a coleta e analisa resultados |
| **Cliente do estabelecimento** | UC-04 | Escaneia o QR Code e envia o feedback |

---

## Agrupamento por Domínio

### Onboarding e Autenticação
> Fluxos de entrada na plataforma. Precisam funcionar antes de qualquer outra coisa.

| UC | Descrição |
|---|---|
| UC-01 | Empresa cria a conta e confirma o e-mail de ativação |
| UC-02 | Gestor faz login com e-mail e senha |
| UC-03 | Gestor redefine a senha quando perde o acesso |

---

### Coleta de Feedback
> O núcleo do produto — como os feedbacks chegam e como o gestor os controla.

| UC | Descrição |
|---|---|
| UC-04 | Cliente escaneia o QR Code e submete a avaliação |
| UC-05 | Gestor ativa, desativa e distribui o QR Code (download, copiar link, compartilhar) |

---

### Configuração
> Personalização da coleta. Cada UC aqui afeta diretamente o que o cliente vê no formulário.

| UC | Descrição |
|---|---|
| UC-06 | Gestor decide quais tipos de feedback a empresa coleta (Produtos, Serviços, Departamentos) |
| UC-07 | Gestor cadastra itens do catálogo, configura perguntas por item e controla o QR Code por item |
| UC-08 | Gestor preenche o contexto do negócio que orienta a IA na geração de insights |
| UC-12 | Gestor atualiza nome, e-mail, telefone e as perguntas dinâmicas gerais da empresa |

---

### Análise e Insights
> O que o gestor lê depois que os feedbacks chegam.

| UC | Descrição |
|---|---|
| UC-09 | Dashboard com métricas, gráficos, estratégia de coleta e últimos 5 feedbacks |
| UC-10 | Listagem paginada com 4 filtros e modal de detalhes completo por feedback |
| UC-11 | Disparo de análise de IA por escopo, visualização de relatório, análise emocional e estatísticas |

---

## Mapa de Dependências

Dependências que impactam diretamente o funcionamento de um UC — não apenas boas práticas, mas bloqueios reais.

```
UC-01 (Cadastro)
  └── UC-02 (Login) — conta precisa existir e estar ativa
        └── Todos os demais UCs do Gestor — sessão precisa estar autenticada

UC-06 (Ativar tipos)
  └── UC-07 (Catálogo) — tipo deve estar ativo para acessar a rota de catálogo
  └── UC-05 (QR Code por item) — tipo deve estar ativo para o QR de catálogo funcionar

UC-07 (Catálogo)
  └── UC-04 (Feedback por item) — item deve estar ACTIVE para o formulário carregar
  └── UC-05 (QR Code por item) — QR de item precisa do item cadastrado

UC-05 (QR Code)
  └── UC-04 (Envio de feedback) — QR Code precisa estar ativo para aceitar envios

UC-08 (Contexto IA)
  └── UC-11 (Insights) — os 3 campos de contexto (objetivo, objetivo analítico, resumo) devem estar preenchidos

UC-04 (Coleta de feedback)
  └── UC-09 (Dashboard) — dados úteis dependem de feedbacks coletados
  └── UC-10 (Listagem) — não há o que listar sem feedbacks
  └── UC-11 (Insights) — mínimo de 10 feedbacks para disparar análise
```

---

## Relação com Testes E2E

Cada UC mapeia para um arquivo de teste. A correspondência é direta:

| Arquivo de UC | Arquivo de teste (futuro) |
|---|---|
| `uc-01-cadastro-conta.md` | `e2e/uc-01-cadastro-conta.spec.ts` |
| `uc-02-login.md` | `e2e/uc-02-login.spec.ts` |
| `uc-03-recuperacao-senha.md` | `e2e/uc-03-recuperacao-senha.spec.ts` |
| ... | ... |
| `uc-12-gestao-perfil.md` | `e2e/uc-12-gestao-perfil.spec.ts` |

Cada item da seção "Base para Teste E2E" de um UC vira um bloco `it()` no arquivo correspondente. O `describe()` recebe o nome do UC.

> Os testes E2E ainda não foram implementados. Esta documentação é a base para quando forem.
