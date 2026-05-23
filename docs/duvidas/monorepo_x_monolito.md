# Provar que o monorepo Multi Domínio é mais viável que o Monolítico

O projeto atualmente tem dois serviços com perfis de carga radicalmente diferentes e na arquitetura antiga(monolito) não consegue tratar recursos distintos para cada um.

## Por que o monolito falha para nosso projeto
| Serviço | Tipo de carga | Latência esperada | Recursos necessários |
| :--- | :--- | :--- | :--- |
| API Gateway (dashboard, feedbacks) | I/O bound — queries rápidas ao Supabase | < 500ms | CPU baixa, timeout curto |
| IA Analyze (análise de sentimentos) | CPU bound + latência externa (LLM) | 10–60 segundos | CPU alta, timeout longo |

- I/O-bound: Singifica que o tempo gasto em uma operação é dominado por espera, não por processamento. No caso do nosso API Gateway, a maior parte do tempo de uma requisição é esperando o banco de dados responder. O servidor não está fazendo cálculo nenhum. Ele manda a query, fica parado aguardando, recebe o resultado e devolve. CPU quase zerada.

- CPU-bound: Significa que o tempo de espera é denominado pelo processador calculando. No caso do nosso IA-Analyze, ele recebe os textos, manda pro LLM, pega a resposta e ainda precisa processar, estruturar e validar tudo isso. O processador trabalha de verdade.

- CPU-bound: O gargalo é o processador calculando. I/O-bound: O gargalo é a espera por algo externo (banco, rede, disco...).

*No monolito, ambos competem pelo mesmo processo Node.js.*

### Traduzindo: 

A proposta do API Gateway é ser rápido, respondendo em milissegundos com baixo uso de processamento para entregar dados ao frontend no menor tempo possível. Já o IA Analyze tem a proposta de entregar a melhor análise possível; para isso, a IA precisa "pensar", o que demora e exige muito do processador.

É nessa diferença drástica de propostas que os dois serviços entram em conflito. Na Arquitetura Monolítica, a aplicação inteira roda na mesma camada e disputa o mesmo processador. Resultado: um serviço sabota o outro e o sistema trava.

Para resolver isso, evoluímos para uma arquitetura Multi-domínio, onde colocamos cada serviço rodando em um servidor separado. Assim, a IA e o Gateway trabalham no seu próprio ritmo, cumprindo suas propostas sem interferências. E para manter a nossa manutenção simples e produtiva, organizamos tudo em um Monorepo: o código das duas aplicações mora no mesmo lugar, mas na hora de ir para o ar (deploy), cada um vai para sua própria máquina.

### Timeout de função (evidência de infraestrutura)
O Feedback Analytics hoje roda em Vercel Serverless Functions. Cada serviço pode ter configuração de timeout diferente.
| Serviço | Arquivo | `maxDuration` necessário | Motivo |
| :--- | :--- | :--- | :--- |
| `api-gateway` | `backends/api-gateway/vercel.json` | 30s | Respostas rápidas (dashboard, login, feedbacks) |
| `ia-analyze` | `services/ia-analyze/vercel.json` | 300s | Chamadas ao LLM (Gemini) podem demorar 30–60s |

Na arquitetura monolítica: Um único `vercel.json`, teria que escolher um `maxDuration`. Se escolher 30s, a análise da IA expira, se escolher 300s, o dashboard e o login ficam 10x mais lentos. Com a arquitetura monorepo multi-domínio podemos ter um `vercel.json` para cada *domínio* e configurar o `maxDuration` para cada um.

### Isolamento de falhas (testes automatizados)

No monolito, uma falha na chamada ao LLM (timeout, rate limit, queda do Gemini) poderia derrubar o processo inteiro — derrubando junto o dashboard, o login e os feedbacks de todos os usuários.

Na arquitetura Multi-domínio, a falha da IA é contida: ela se torna um erro HTTP controlado (502) que só afeta o endpoint de análise. O restante do sistema continua funcionando normalmente.

### Deploy independente (evidência de agilidade de entrega)

No monolito, qualquer alteração — mesmo que seja só na lógica da IA — obriga um redeploy de toda a aplicação. Isso significa downtime (ou risco de downtime) para o dashboard, o login e os feedbacks enquanto um novo modelo de IA é publicado. Não somente isso, tem outras inumeras desvantagens, efeito dominó, lentidão no deploy, desperdício de testes (overhead de CI/CD).

Na arquitetura Multi-domínio, cada serviço vai ao ar de forma independente. Mudar o modelo LLM não toca o Gateway. Corrigir um bug no dashboard não redeploiya a IA.

Cada serviço tem seu próprio workflow de deploy (`.github/workflows/deploy-api.yml`, `deploy-ia-analyze.yml`). Um push em `services/ia-analyze/` dispara apenas o deploy da IA. O Gateway não é tocado, não reinicia, não tem downtime.


## Por que escolhemos especificamente o Monorepo Multi-domínio

Existem outras arquiteturas que também separam os serviços — como ter dois repositórios completamente independentes, ou uma arquitetura de microserviços completa. A escolha pelo Monorepo Multi-domínio foi deliberada, e cada parte do nome tem um motivo.

### Por que Monorepo (e não dois repositórios separados)?

Com dois repositórios separados, o projeto ficaria dividido em dois lugares diferentes. Toda vez que o contrato entre o Gateway e a IA mudasse (por exemplo, o formato da resposta da análise), seria necessário atualizar os dois repos, abrir dois pull requests e garantir manualmente que os dois estão sincronizados. É fácil um ficar para trás.

No Monorepo, os dois serviços compartilham a pasta `shared/`, onde ficam as interfaces e contratos da comunicação entre eles. Uma mudança no contrato aparece em um único commit, afeta os dois serviços ao mesmo tempo e o TypeScript avisa na hora se algum dos lados quebrou. Tudo em um lugar só, sem risco de dessincronização.

Além disso, para uma equipe pequena, gerenciar um repositório é infinitamente mais simples do que gerenciar dois: um único histórico de commits, uma única configuração de CI/CD, um único lugar para abrir issues e pull requests.

### Por que Multi-domínio?

#### Por que não um arquitetura de microserviços ?
Uma arquitetura de microserviços decompõe tudo em dezenas de serviços minúsculos — login vira um serviço, feedbacks vira outro, notificações vira outro. Isso faz sentido para empresas grandes com dezenas de times trabalhando em paralelo, mas traz uma complexidade operacional enorme para projetos menores.

No Feedback Analytics, separamos em domínios **onde havia um motivo técnico real**: a análise IA tem perfil de carga radicalmente diferente do Gateway e precisava de isolamento. O restante (dashboard, feedbacks, autenticação) ficou consolidado no API Gateway, que é a escolha certa para operações rápidas e I/O-bound.

Resultado: a complexidade do sistema é proporcional ao tamanho do problema — nada a mais, nada a menos.

A separação por domínios também resolve um problema de escala: se a demanda da IA crescer, é possível adicionar instâncias apenas para o `ia-analyze` sem tocar no Gateway. No monolito, escalar a IA significa escalar a aplicação inteira — pagando por recursos que o Gateway não precisa.

### Como fizemos isso funcionar — os workflows de deploy

Para que o Monorepo Multi-domínio funcione de verdade, não basta separar as pastas. É preciso que o processo de publicação (deploy) de cada serviço seja independente. É aí que entram os workflows do GitHub Actions.

Criamos três workflows separados, um para cada domínio:

| Workflow | Serviço que publica |
| :--- | :--- |
| `deploy-api.yml` | `backends/api-gateway` |
| `deploy-ia-analyze.yml` | `services/ia-analyze` |
| `deploy-web.yml` | `apps/web` |

Cada workflow só instala as dependências do seu próprio serviço (mais a pasta `shared/`, que contém os contratos compartilhados entre eles). O deploy da IA, por exemplo, nunca baixa nem toca no código do Gateway — são processos completamente isolados.

**Acionamento manual com confirmação (e por que não usamos git tag)**

Os três workflows são acionados manualmente pelo GitHub (não disparam automaticamente a cada push). Para iniciar um deploy, é necessário digitar `ok` em um campo de confirmação.

Uma alternativa comum seria usar git tags como gatilho — criar uma tag `v2.0.0` no repositório para disparar o deploy automaticamente. Essa abordagem funciona bem em repositórios com um único serviço, mas em um Monorepo ela cria um problema: a tag é aplicada ao repositório inteiro.

Se criarmos a tag `v2.0.0`, qual serviço está sendo publicado? O Gateway? A IA? O frontend? Todos ao mesmo tempo? Para funcionar, precisaríamos de convenções como `api-v2.0.0`, `ia-v2.0.0`, `web-v2.0.0` — o que adiciona complexidade sem trazer benefício real para o tamanho do projeto.

O acionamento manual resolve isso de forma simples: cada deploy é uma ação explícita e intencional, direcionada a um serviço específico, sem ambiguidade.

**Sem interferência entre deploys**

Cada workflow tem seu próprio grupo de concorrência (`deploy-api`, `deploy-ia-analyze`, `deploy-web`). Isso significa que publicar a IA e o Gateway ao mesmo tempo não causa conflito — cada um segue seu próprio fluxo sem cancelar o outro.

**Dois ambientes, um único workflow**

Cada workflow serve tanto para o ambiente de testes (branch `homolog` → deploy de preview) quanto para produção (branch `main` → deploy final). A lógica de qual ambiente usar está dentro do próprio workflow, então não precisamos manter arquivos duplicados para cada situação.

**O `vercel.json` de cada domínio**

Na hora de publicar, cada workflow aponta para o `vercel.json` do seu próprio serviço usando a flag `--local-config`. É nesse arquivo que ficam as configurações específicas de cada domínio — incluindo o `maxDuration` diferente para o Gateway e para a IA.

