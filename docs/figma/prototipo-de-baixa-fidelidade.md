# Design de Alta Fidelidade — Feedback Analytics

## Visão Geral

Este documento descreve o protótipo de baixa fidelidade do **Feedback Analytics**, cobrindo todas as telas do sistema, fluxos de navegação, estados de UI e comportamentos esperados para guiar a implementação front-end.

O protótipo contempla transições animadas entre telas, simulando ao máximo o produto final. As seções estão organizadas por contexto de autenticação: **Usuário Deslogado**, **Usuário Logado** e **Assets de Componentes**.

---

## Usuário Deslogado

São telas acessadas pelos usuários da aplicação sem autenticação válida, seja acessados por links ou leituras de qrcode.

---

### 1. Home

**Rota:** `/`  
**Objetivo:** Primeira impressão do produto. Tela de apresentação comercial, atrativa e orientada à conversão.

#### Seções da Página

| Seção | Descrição |
|---|---|
| Hero | Título principal, subtítulo de valor, CTA primário |
| Como funciona | Explicação visual em etapas do fluxo do produto |
| Benefícios | Cards destacando os diferenciais da plataforma |
| CTA Final | Chamada para cadastro/conversão ao final da página |

---

### 2. Coleta de Feedbacks

**Rota:** `/feedback/:qrcode?enterprise=:id`  
**Objetivo:** Página pública onde o cliente final deposita seu feedback após escanear o QR Code.

> Esta rota é **pública**, mas só deve ser acessada via QR Code gerado por um usuário logado. Acessos diretos sem um `id` válido devem retornar erro ou página de QR Code inválido.

#### Campos do Formulário

| Campo | Tipo | Obrigatório |
|---|---|---|
| Avaliação geral | Estrelas (1–5) | Sim |
| Sentimento | Seleção (Péssimo, Ruim, Mediana, Boa, Ótima) | Sim ||
| Comentário livre | Textarea | Sim |
| Informações pessoais | Nome, e-mail (opcionais) | Não |

---


## Usuário Logado

São telas acessadas pelos usuários da aplicação com autenticação válida, por autenticação via tela de login.

### 3. Dashboard

**Rota:** `/dashboard`  
**Objetivo:** Visão centralizada dos feedbacks coletados, com cards interativos e dados em tempo real.

#### Componentes da Tela

| Componente | Descrição |
|---|---|
| Header | Nome do usuário, e botões que facilitam o fluxo do usuário |
| Card — Total de Feedbacks | Número total de feedbacks recebidos |
| Card — Sentimentos | Média da satisfação geral dos clientes |
| Card — Feedbacks Positivos | Feedbacks positivos recebidos |
| Card — Feedbacks Críticos | Feedbacks negativos recebidos |
| Feedbacks Recentes | Lista com os últimos feedbacks recebidos |
| Estratégia de Coleta |  Informações da empresa para melhorar a análise feita pela IA|
| Radar de satisfação | Lista com o total de feedbacks positivos, neutros ou negativos |

---

### 4. Perfil do Usuário

**Rota:** `/perfil`  
**Objetivo:** Visualização e edição das informações pessoais do usuário.

#### Informações Exibidas

| Campo | Editável |
|---|---|
| Avatar / Foto de perfil | Sim |
| Nome completo | Sim |
| E-mail | Sim |
| Senha | Sim (campo separado) |
| Data de cadastro | Não |
| CPF/CNPJ | Não |

---

### 5. QR Code

**Rota:** `/qrcode`  
**Objetivo:** Gerenciamento dos QR Codes gerados pelo usuário para coleta de feedbacks.

#### Ações Disponíveis por QR Code

| Ação | Descrição |
|---|---|
| Habilitar | Habilita o QR Code para receber feedbacks |
| Desabilitar | Desabilita o QR Code (feedbacks não são aceitos) |
| Compartilhar | Copia o link do QR Code |
| Copiar link | Copia a URL do QR Code para a área de transferência |
| Download | Baixar o QR Code para a impressão |

---

#### Componentes da Tela

| Componente
|---|
| Pesquisa |
| Painel de filtros |
| Card de Feedback |
| Paginação |

---

### 5. Relatório IA

**Rota:** `/relatorio-ia`  
**Objetivo:** Geração e visualização de insights automáticos baseados nos feedbacks, utilizando inteligência artificial.

#### Conteúdo do Relatório

| Seção | Descrição |
|---|---|
| Resumo Executivo | Parágrafo gerado pela IA com os principais pontos |
| Sentimento geral | O clima pode ser positivo, neutro ou negativo |
| Visão geral | Uma visão geral resumida dos feedbacks coletados |
| Sugestões de Ação | Recomendações práticas geradas pela IA |

---
