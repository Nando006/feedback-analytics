# Backend (API Gateway) — Arquitetura e Estrutura 

O backend utiliza uma combinação de padrões arquiteturais para garantir segurança, organização e escalabilidade.
Podemos a arquitetura em duas visões:

- **Visão Macro:** Como o backend se encaixa no sistema inteiro
- **Visão Micro:** Como o código está organizado por dentro

## Visão Macro: API Gateway e BFF (Backend-For-Frontend)

O backend principal (o `api-gateway`) atua como um **Backend-for-Frontend (BFF)**. Isso significa que ele é o **único ponto de entrada** para o Frontend. O Frontend nunca acessa o banco de dados diretamente nem fala com serviços externos, tudo passa pelo *Gateway*.

Ele segue uma topologia **Hub-and-Spoke**, onde o API Gateway é o centro (hub) que orquestra a comunicação com:

- O banco de dados (Supabase / PostgreSQL).
- O serviço de autenticação (Supabase Auth).
- Outros microserviços internos.

**Vantagens disso:** Centraliza a validação de segurança (tokens JWT) e isola lógicas complexas, deixando o Frontend mais leve.

## Visão Micro: Arquitetura em Camadas (Layered Architecture)

Internamente, o API Gateway adota uma **Arquitetura em Camadas** com responsabilidades estritamente definidas. O fluxo de dados segue um caminho rigoroso de *ida e volta*, onde nenhuma camada pula a outra:

1. **Rotas (`routes/`):** A porta de entrada. Recebem a requisição HTTP e direcionam para o controller correto.
2. **Middlewares (`middlewares/`):** A segurança. Validam a autenticação (ex: o token JWT) antes de deixar a requisição prosseguir.
3. **Controllers (`controllers/`):** Os "gerentes". Eles recebem a requisição validada, extraem os parâmetros ou o corpo (body), formatam e repassam a tarefa para o *Service*. Eles não tocam no banco de dados.
4. **Services (`services/`):** O "cérebro". Aqui vivem as regras de negócio. O Service toma as decisões, valida requisitos (ex: verificar se há feedbacks suficientes para analisar) e orquestra o fluxo de dados.
5. **Repositories (`repositories/`):** Os "arquivistas". É a única camada autorizada a fazer queries no banco de dados (Supabase) para ler, inserir ou atualizar dados.

Há também pastas de apoio estrutural, como a `libs/`, que contém funções puras de domínio (sem efeitos colaterais) para ajudar em lógicas específicas (como montar lotes de análise para a IA), e os `providers/`, que fazem a comunicação HTTP com outros serviços

### Suporte a Microserviços Independentes

Ao invés de processar tudo no mesmo lugar e sobrecarregar o API Gateway, nossa arquitetura oferece suporte à extração de processamentos pesados ou integrações específicas para **microserviços independentes**.

**Por que separar?**
- **Escalabilidade independente:** Serviços com alta demanda de processamento podem escalar sem exigir mais recursos do Gateway.
- **Isolamento de falhas:** Se um serviço ou integração externa falhar, o sistema principal continua operando normalmente.
- **Responsividade:** Permite que o Gateway continue rápido e responsivo para as requisições do Frontend, mesmo lidando com tarefas demoradas.

Um exemplo prático dessa aplicação no nosso sistema é o microserviço `ia-analyze`, que lida com a inteligência artificial. Ele isola as chamadas à API do provedor LLM externo, garantindo que o Gateway não sofra gargalos durante análises massivas de texto.
