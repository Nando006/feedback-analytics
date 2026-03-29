# Ideia 04 - Header de Insights com notificacoes e analise

## Status
Proposta documentada e pronta para implementacao.

## Objetivo
Criar um header mais completo para a area de insights, com foco em operacao diaria, visibilidade de contexto e acionamento rapido da analise.

## Contexto
A tela de insights precisa de um topo mais funcional para:
- indicar eventos novos (feedbacks/notificacoes)
- mostrar claramente a empresa em foco
- manter acesso rapido ao processamento de IA (botao "Analisar feedbacks")
- melhorar navegacao e experiencia geral

## Proposta
Implementar um novo header seguindo o conceito visual do mock e adaptado ao fluxo atual do projeto.

Elementos principais:
1. Perfil do usuario (lado esquerdo)
2. Nome da empresa (destaque no centro)
3. Notificacoes de feedbacks (lado direito)
4. Botao "Analisar feedbacks" (CTA principal)

## Regras de produto
1. Botao "Atualizar relatorio"
- Permanece no contexto da pagina de relatorio.
- Nao analisa feedback bruto.

2. Botao "Analisar feedbacks" (no header)
- Executa analise sob demanda.
- Processa somente feedbacks elegiveis.
- Habilitacao condicionada:
  - minimo de 10 feedbacks elegiveis.

3. Nome da empresa
- Sempre visivel no header.
- Truncar quando exceder o espaco disponivel.

4. Notificacoes
- Exibir badge com total de eventos nao lidos.
- Priorizar eventos ligados a feedback e analise.

## Funcionalidades detalhadas
### 1) Perfil do usuario
- Avatar + nome resumido.
- Dropdown com:
  - Meu perfil
  - Configuracoes
  - Sair

### 2) Nome da empresa
- Exibir nome da empresa logada como referencia de contexto.
- Em nomes longos:
  - aplicar truncate visual
  - tooltip com nome completo

### 3) Notificacoes de feedbacks
Tipos recomendados:
- novo feedback recebido
- analise concluida
- bloqueio de analise por volume insuficiente

Comportamento:
- badge com contador de nao lidas
- abrir painel/lista ao clicar
- marcar como lida ao abrir ou por acao individual

### 4) Botao "Analisar feedbacks"
Estado habilitado:
- label: "Analisar feedbacks (N)"
- N = total elegivel

Estado desabilitado:
- label: "Analisar feedbacks"
- texto de apoio: "Minimo de 10 feedbacks elegiveis"

Estado executando:
- loading no botao
- impedir clique duplicado

Estado sucesso:
- toast: "X feedbacks analisados com sucesso"

Estado erro:
- toast/modal com mensagem clara e acao de tentar novamente

## Layout recomendado
Desktop:
- esquerda: perfil
- centro: nome da empresa
- direita: notificacoes + botao analisar feedbacks

Mobile:
- priorizar botao analisar e notificacoes
- reduzir elementos textuais
- perfil em icone compacto

## Acessibilidade
- botoes com aria-label
- foco visivel no teclado
- contraste adequado para badge e CTA
- tooltip acessivel em nomes truncados

## Telemetria minima
Eventos sugeridos:
- header_notifications_opened
- header_analyze_feedbacks_clicked
- header_analyze_feedbacks_blocked_minimum
- header_analyze_feedbacks_success
- header_analyze_feedbacks_error

Dados minimos por evento:
- enterprise_id
- scope_type
- period_filter (quando existir)
- eligible_count
- processed_count
- duration_ms

## MVP de implementacao
1. UI base do novo header
- estrutura de layout e estilos responsivos

2. Dados de contexto
- nome da empresa
- dados do usuario (nome/avatar)
- contador de notificacoes
- contador de feedbacks elegiveis

3. Botao Analisar feedbacks
- estados: habilitado, desabilitado, loading
- acao de submit para analise

4. Notificacoes
- icone + badge
- painel simples com lista inicial

5. Feedback visual
- toasts para sucesso e erro

6. Testes
- renderizacao do header
- habilitacao/desabilitacao do botao
- contador de notificacoes
- responsividade basica

## Criterios de aceite
- Header exibe perfil, nome da empresa, notificacoes e botao de analise.
- Botao "Analisar feedbacks" respeita regra de minimo de 10 elegiveis.
- Nome da empresa permanece legivel e com fallback para nomes longos.
- Notificacoes exibem badge e lista funcional basica.
- Sem regressao de navegacao e sem conflito com o fluxo atual de relatorio.

## Dependencias com ideias anteriores
- Ideia 01: `description_quality` em `feedback_analysis`
- Ideia 02: analise por periodo com foco em qualidade
- Ideia 03: separacao entre "Atualizar relatorio" e "Analisar feedbacks"

## Especificacao tecnica da notificacao
### Modelo de dados sugerido
Tabela sugerida: `user_notifications`

Campos minimos:
- id (uuid, pk)
- enterprise_id (uuid, not null)
- user_id (uuid, not null)
- type (text, not null)
- title (text, not null)
- message (text, not null)
- payload (jsonb, null)
- is_read (boolean, not null, default false)
- read_at (timestamptz, null)
- created_at (timestamptz, not null, default now())

Tipos recomendados para `type`:
- feedback_received
- analysis_completed
- analysis_blocked_minimum
- analysis_failed

Payload recomendado (jsonb):
- scope_type
- period_from
- period_to
- eligible_count
- processed_count
- error_code (quando existir)

Indices recomendados:
- (user_id, is_read, created_at desc)
- (enterprise_id, created_at desc)

### Endpoints sugeridos
1. Listar notificacoes
- GET /api/protected/user/notifications
- Query params:
  - page
  - limit
  - only_unread (true/false)

Resposta:
- items: notificacoes ordenadas por created_at desc
- unread_count: total de nao lidas
- page_info

2. Marcar uma notificacao como lida
- PATCH /api/protected/user/notifications/:id/read

3. Marcar todas como lidas
- PATCH /api/protected/user/notifications/read-all

4. Contador rapido para badge
- GET /api/protected/user/notifications/unread-count

### Estrategia de atualizacao no frontend
Estrategia recomendada para MVP:
- polling leve a cada 30s para unread_count
- refresh completo da lista apenas quando abrir o painel

Estrategia evolutiva (fase 2):
- realtime com websocket/supabase realtime para reduzir polling

### Regras de retencao e paginacao
- Reter notificacoes por 90 dias (ajustavel por configuracao)
- Paginar lista com limit padrao 20
- Permitir filtro only_unread para performance no painel inicial

### Regras de seguranca
- Toda operacao filtrada por user_id e enterprise_id do usuario autenticado
- Usuario nao pode ler nem alterar notificacao de outro usuario
- Validar payload para evitar dados sensiveis no jsonb

### Regras de disparo
Eventos que devem gerar notificacao no MVP:
- novo feedback recebido (agregado opcional por janela de tempo)
- analise concluida com sucesso
- analise bloqueada por minimo insuficiente
- falha de analise

### Testes tecnicos recomendados
1. Backend
- lista retorna apenas notificacoes do usuario
- marcar uma como lida atualiza is_read e read_at
- marcar todas como lidas funciona sem afetar outros usuarios
- unread_count reflete estado real

2. Frontend
- badge atualiza com unread_count
- painel carrega paginado
- acao de marcar como lida atualiza UI local
- acao de marcar todas sincroniza badge e lista

3. Integracao
- gerar notificacao ao finalizar analise
- gerar notificacao ao bloquear por minimo
- garantir ordenacao por created_at desc
