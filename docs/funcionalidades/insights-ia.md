# Funcionalidade — Análise IA de Feedbacks

## O Que É

O **pipeline de Análise IA** processa feedbacks de texto coletados via QR Code e retorna classificações semânticas automáticas. Ele usa o **Google Gemini** como modelo de linguagem e é executado pelo microserviço `ia-analyze`.

O resultado alimenta o painel de insights da empresa, permitindo identificar padrões de satisfação sem nenhuma análise manual.

## Por Que Existe

Sem análise automatizada, uma empresa com centenas de feedbacks mensais precisaria ler cada um individualmente para extrair padrões. O pipeline resolve isso em segundos, retornando sentimentos, temas recorrentes e recomendações contextualizadas ao negócio da empresa.

## Como Funciona

1. A empresa clica em **"Analisar feedbacks"** no painel de insights
2. O API Gateway busca os feedbacks **ainda não analisados** e remove duplicatas via `feedback_analysis`
3. Os feedbacks são agrupados em batches por escopo (`COMPANY`, `PRODUCT`, `SERVICE`, `DEPARTMENT`)
4. Cada batch é enviado ao serviço `ia-analyze`, que chama o Google Gemini com um prompt contextualizado
5. O serviço processa sentimento, keywords e categorias por feedback e monta os insights globais por batch
6. Os resultados são persistidos em `feedback_analysis` e `feedback_insights_report`
7. O dashboard exibe o total analisado e os insights gerados

---

## Escopos de Análise

A análise é sempre **segmentada por escopo**. Os escopos disponíveis dependem da configuração de catálogo da empresa:

| Escopo | Cor | Quando Disponível |
|---|---|---|
| `COMPANY` | Indigo | Sempre |
| `PRODUCT` | Verde | Quando `uses_company_products = true` |
| `SERVICE` | Âmbar | Quando `uses_company_services = true` |
| `DEPARTMENT` | Rosa | Quando `uses_company_departments = true` |

O usuário seleciona o escopo usando o **ScopeSelectorRadial** — um seletor circular animado no cabeçalho do painel.

---

## Tipos de Análise

### Analisar Feedbacks Brutos (`analyze-raw`)

Processa feedbacks **ainda não analisados**. Garante deduplicação comparando com IDs já em `feedback_analysis`.

- **Limite padrão:** 50 feedbacks por execução (máx. 100)
- **Mínimo obrigatório:** 5 feedbacks para análise relevante
- **Requer:** `collecting_data` preenchido (objetivo, resumo da empresa)

### Gerar Insights (`regenerate-insights`)

Recalcula os **insights globais** (sumário e recomendações) com base nos feedbacks **já analisados**. Útil para atualizar relatórios sem reprocessar toda a base.

---

## Estrutura de Saída

### Por Feedback

```json
{
  "feedback_id": "uuid",
  "sentiment": "positive",
  "categories": ["atendimento", "rapidez"],
  "keywords": ["excelente", "equipe", "profissional"]
}
```

### Por Contexto (Insights Globais)

```json
{
  "scope_type": "PRODUCT",
  "catalog_item_id": "uuid-do-produto",
  "catalog_item_name": "Hambúrguer Artesanal",
  "analyzedCount": 23,
  "globalInsights": {
    "summary": "A maioria dos feedbacks é positiva, com destaque para sabor e apresentação.",
    "recommendations": [
      "Manter consistência no tempero",
      "Avaliar tempo de espera nos horários de pico"
    ]
  }
}
```

---

## Controles do Painel

A página `/user/insights/reports` tem dois botões principais:

| Botão | Ação | Endpoint chamado |
|---|---|---|
| **Analisar feedbacks** | Processa novos feedbacks brutos | `POST /protected/ia-analyze/analyze-raw` |
| **Gerar insights** | Regenera insights dos já analisados | `POST /protected/ia-analyze/regenerate-insights` |

Ambos ficam **desabilitados** enquanto uma operação está em andamento.

---

## Troubleshooting

| Código de Erro | Status | O Que Significa | Como Resolver |
|---|---|---|---|
| `collecting_data_required_for_analysis` | 422 | Empresa não preencheu dados de contexto | Preencha **Objetivo** e **Resumo da Empresa** em Configurações |
| `insufficient_feedbacks_for_analysis` | 422 | Menos de 5 feedbacks disponíveis | Colete mais feedbacks antes de analisar |
| `failed_ia_request` | 502 | Falha na chamada ao Gemini | Verifique `GEMINI_API_KEY` no serviço ia-analyze |
| `invalid_ai_response` | 502 | Gemini retornou resposta inválida | Tente novamente; pode ser instabilidade do modelo |

---

## Referência Técnica

- [Endpoints do API Gateway](../backend/endpoints.md)
- [Regras de Negócio — IA](../backend/regras-negocio.md)
- [Serviço IA Analyze — Visão Geral](../servicos/ia-analyze/visao-geral.md)
