# API Gateway BFF (Express)

Camada responsável por autenticação, sessão, segurança, orquestração de domínio e integração entre frontend, banco e serviços externos.

## Arquitetura BFF com 4 camadas

1. Endpoints HTTP: expõem rotas públicas e protegidas para o frontend.
2. Middlewares e Segurança: aplicam CORS, autenticação, sessão e contexto da requisição.
3. Orquestração e Regras de Negócio (Controllers): aplicam regras de negócio e coordenam fluxos.
4. Contratos e Respostas Tipadas: padronizam payloads, erros e respostas entre domínios.

### Componentes da camada de orquestração

1. Repositories: conversam com o banco de dados (Supabase RLS).
2. Services: conversam com serviços externos.

## Responsabilidades do API Gateway

1. Camada 1 (Endpoints HTTP): receber chamadas do frontend e entregar contratos estáveis de API.
2. Camada 2 (Middlewares e Segurança): validar autenticação e autorização antes de acessar rotas protegidas e montar contexto da requisição.
3. Camada 3 (Controllers): orquestrar regras de negócio sem acoplar a interface web ao banco.
4. Camada 3a (Repositories): integrar com Supabase respeitando políticas de RLS e contexto de usuário.
5. Camada 3b (Services): delegar processamento especializado para serviços externos de domínio quando necessário.
6. Camada 4 (Contratos e Respostas Tipadas): retornar respostas padronizadas, com tratamento consistente de erro e status HTTP.

## Fluxo de requisição

1. Frontend chama um endpoint HTTP (camada 1).
2. Endpoint aplica middlewares de segurança e contexto (camada 2).
3. Controller orquestra o caso de uso e as regras de negócio (camada 3).
4. Repository consulta o Supabase com RLS e Service chama integração externa quando necessário (camada 3).
5. Controller monta o contrato tipado de sucesso ou erro (camada 4).
6. Endpoint devolve a resposta final ao frontend.

## Resumo arquitetural

O API Gateway funciona como BFF em 4 camadas: expõe endpoints HTTP, aplica segurança e contexto de requisição, orquestra regras de negócio por Controllers (com Repositories e Services), e devolve contratos tipados com respostas consistentes para o frontend.