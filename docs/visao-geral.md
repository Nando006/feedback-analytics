# Visão Geral — Feedback Analytics
o Projeto Feedback Analytics surgiu da identificação de um problema recorrente enfrentado por muitas empresas:

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

1. **Colete** — O sistema oferece canais estruturados para coletar feedbacks:
  - **Canal QRCode**: a empresa gera QR Codes exclusivos por produto, serviço ou departamento; o cliente escaneia e avalia sem precisar criar conta.
2. **Analise** — um pipeline de IA (Google Gemini) processa os feedbacks automaticamente, classificando sentimento, extraindo palavras-chave e gerando insights
3. **Decida** — o dashboard exibe relatórios acionáveis por escopo, permitindo comparar produtos, departamentos ou serviços

## Para Quem É

| Perfil | Dor que resolve |
|---|---|
| Restaurantes e lojas físicas | Coleta presencial sem atrito para o cliente |
| Gestores de qualidade | Métricas de satisfação por produto ou setor |
| Times sem equipe técnica | Solução pronta, sem necessidade de desenvolvimento próprio |

## Estrutura do Sistema

O projeto é um **monorepo** com três serviços principais:

```
feedback-analytics/
├── apps/web/              → Frontend React (público + dashboard)
├── backends/api-gateway/  → API REST — ponto único de entrada do backend
└── services/ia-analyze/   → Microserviço de análise IA (Google Gemini)
```

- O **Frontend** serve o formulário público de coleta e o dashboard protegido da empresa.
- O **API Gateway** centraliza autenticação, lógica de negócio e orquestra Supabase e IA.
- O **IA Analyze** é um microserviço interno: só o Gateway o acessa, nunca o frontend.

## Próximos Passos

- [Rodar o ambiente local → Guia de Instalação](./guia-instalacao.md)
- [Entender como os serviços se conectam → Arquitetura](./arquitetura.md)
- [Ver todas as funcionalidades → Funcionalidades](./funcionalidades/visao-geral.md)
