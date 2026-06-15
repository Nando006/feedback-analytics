# Próximos Passos — Implementações Futuras

Esta pasta registra **o que ainda queremos construir** no Feedback Analytics. Cada arquivo descreve uma frente de trabalho: o objetivo (em linguagem de produto), como o sistema funciona hoje (ancorado no código real), a proposta, onde mexer por camada, riscos e um esboço de fases.

> Estes documentos são **planejamento**, não especificação final. Servem para lembrar a intenção, registrar as decisões em aberto e dar um ponto de partida técnico para quem for implementar.

## Como usar esta pasta

- Um arquivo por frente de trabalho, nomeado `NN-titulo-curto.md`.
- Sempre que uma ideia virar trabalho real, atualize o **Status** no topo do arquivo e registre as decisões tomadas.
- Quando algo for entregue, mova o resumo para o `docs/changelog_documentacao.md` e marque o item como ✅ aqui.

## Itens planejados

| # | Frente | Status | Esforço estimado | Depende de |
|---|---|---|---|---|
| [01](./01-metricas-por-periodo-e-comparacao.md) | Métricas por período + comparação entre intervalos | 🟡 Planejado | Médio | Índice em `feedback.created_at` |
| [02](./02-feedback-por-audio.md) | Feedback por áudio (configurável) no formulário público | 🟡 Planejado | Alto | Supabase Storage; decisão de transcrição |
| [03](./03-reorganizacao-das-telas-de-configuracao.md) | Reorganização das telas de configuração (catálogo, perguntas, QR) | 🟡 Planejado | Médio-Alto | — (pode começar já) |
| [04](./04-preview-do-formulario.md) | Preview ao vivo do formulário na tela de configuração | 🟡 Planejado | Médio | — (anda junto com o item 03) |

**Legenda de status:** 🟡 Planejado · 🔵 Em andamento · ✅ Entregue · ⏸️ Pausado

## Ordem sugerida (não obrigatória)

A ordem abaixo é uma sugestão baseada em dependências e retorno; o time decide a prioridade real.

1. **Item 03 (reorganização das telas)** — não tem dependência de infraestrutura e ataca a maior dor de usabilidade atual. O **preview do formulário** (item 04) encaixa naturalmente aqui.
2. **Item 01 (métricas por período)** — esforço médio, sem infra nova além de um índice; alto valor para o gestor.
3. **Item 02 — áudio** — maior esforço e a única frente que exige infraestrutura nova (Storage + transcrição + custo de IA). Deixar por último ou tratar como projeto à parte.

## Documentação relacionada (estado atual do sistema)

- Visão geral e arquitetura: [`docs/visao-geral.md`](../docs/visao-geral.md), [`docs/arquitetura.md`](../docs/arquitetura.md)
- Coleta por QR Code: [`docs/funcionalidades/coleta-qrcode.md`](../docs/funcionalidades/coleta-qrcode.md), [`docs/funcionalidades/qrcode-escopo-dinamico.md`](../docs/funcionalidades/qrcode-escopo-dinamico.md)
- Painel de insights / métricas: [`docs/funcionalidades/painel-insights-ia.md`](../docs/funcionalidades/painel-insights-ia.md)
- Pipeline de IA: [`docs/servicos/ia-analyze/visao-geral.md`](../docs/servicos/ia-analyze/visao-geral.md)
- Casos de uso de configuração: [UC-06](../docs/casos-de-uso/uc-06-ativacao-tipos-feedback.md), [UC-07](../docs/casos-de-uso/uc-07-configuracao-catalogo.md), [UC-09](../docs/casos-de-uso/uc-09-dashboard.md)
