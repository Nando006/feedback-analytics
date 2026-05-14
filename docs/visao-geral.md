# Visão Geral — Feedback Analytics
O projeto Feedback Analytics surgiu da identificação de um problema recorrente enfrentado por muitas empresas:

"A ausência de um canal eficiente e estruturado para a gestão de feedbacks dos clientes."

Essa lacuna compromete a capacidade de evoluir a empresa de forma contínua e estratégica.

## O Objetivo

Oferecer às empresas uma ferramenta acessível, automatizada e inteligente para transformar opiniões de clientes em decisões estratégicas, promovendo a melhoria contínua, a inovação e a fidelização de clientes.

## O Problema

Atualmente diversas organizações, especialmente de pequeno e médio porte não contam com mecanismos eficazes para:

- Coletar feedbacks de forma acessível e multicanal.
- Analisar essas informações de forma estruturada.
- Extrair insights relevantes que possam direcionar ações de melhoria, inovação e fidelização de clientes.

Essas deficiências leva à perda de oportunidades estratégicas e prejudica a competitividade das empresas no mercado.

O resultado: gestores decidem com base em intuição, não em evidência.

## A Solução

O **Feedback Analytics** transforma coleta e análise de feedbacks em um processo estruturado e inteligente em três etapas:

1. **Colete** — O sistema oferece canal estruturado para coletar feedbacks:
    - **Canal QRCode**: A empresa gera QR Codes exclusivos por produto, serviço ou departamento, o cliente escaneia e avalia sem precisar criar conta.
2. **Analise** — Um pipeline de IA com provedor LLM externo configurável interpreta cada feedback automaticamente, classifica sentimento, extrai temas e palavras-chave e gera insights acionáveis para melhorar produtos, serviços e experiência do cliente.
3. **Decida** — O dashboard apresenta um painel de insights por escopo, mostrando sentimento dos clientes, temas recorrentes, recomendações e comparação entre empresa, produtos, serviços ou departamentos. Assim, o gestor transforma feedbacks em ações concretas.

## Para Quem É

| Perfil | Dor que resolve |
|---|---|
| Restaurantes e lojas físicas | Coleta presencial sem atrito para o cliente |
| Gestores de qualidade | Métricas de satisfação por produto ou setor |
| Times sem equipe técnica | Solução pronta, sem necessidade de desenvolvimento próprio |

## Estrutura do Sistema

O projeto é um **monorepo multi domínios**. Cada domínio é independente, com seu próprio workflow no GitHub e servidor, mas todos compartilham o mesmo banco de dados.

Atualmente temos os seguintes domínios:

- `apps/web/` → Frontend React (público + dashboard)
- `backends/api-gateway/` → API REST — ponto único de entrada do backend
- `services/ia-analyze/` → serviço isolado de análise IA (provedor LLM externo configurável)

- O **Frontend** serve o formulário público de coleta e o dashboard protegido da empresa.
- O **API Gateway** centraliza autenticação, lógica de negócio, orquestra Supabase e orquestra as chamadas de IA.
- O **IA Analyze** é um serviço isolado de análise de feedbacks: só o Gateway o acessa e ele não expõe rotas ao frontend.

No domínio `services/` o projeto foi pensado para abrigar diferentes serviços pequenos. Serviços com grande impacto no produto, como `ia-analyze`, são separados como domínios isolados para manter autonomia e facilitar deploys específicos.

## Próximos Passos

- [Rodar o ambiente local → Guia de Instalação](./guia-instalacao.md)
- [Entender como os serviços se conectam → Arquitetura](./arquitetura.md)
- [Ver todas as funcionalidades → Funcionalidades](./funcionalidades/visao-geral.md)
