# Painel de Insights com Relatório Global de IA

## O Que É

É onde o ciclo do produto se fecha. O painel de insights (`/user/insights/reports`) permite que o gestor dispare a análise de inteligência artificial sobre os feedbacks coletados e visualize um relatório estruturado com:

- **Resumo situacional** — o que os clientes estão dizendo, de forma consolidada
- **Recomendações acionáveis** — o que fazer com base nos padrões identificados
- **Distribuição de sentimentos** — proporção de feedbacks positivos, neutros e negativos
- **Top categorias e keywords** — os temas e termos mais relevantes extraídos dos textos

---

## Por Que Existe

Coletar feedback é apenas metade do trabalho. A outra metade é **entender o que os dados estão dizendo**.

Uma empresa com 200 feedbacks mensais não pode ler cada um individualmente para extrair padrões. Sem análise automatizada, o dado coletado envelhece numa tabela sem nunca gerar valor.

O painel de insights resolve isso: em segundos, converte centenas de textos brutos em um relatório legível, contextualizado ao negócio da empresa e segmentado por escopo.

> A coleta captura a voz do cliente. O painel de insights traduz essa voz em ação gerencial.

---

## Como Funciona

O painel oferece dois tipos de operação:

### 1. Analisar Feedbacks Brutos
Processa os feedbacks que **ainda não passaram pela IA**. Ideal para rodar periodicamente, à medida que novos feedbacks chegam.

```
Gestor clica em "Analisar feedbacks"
        ↓
API busca feedbacks não presentes em feedback_analysis
        ↓
Agrupa por escopo (Empresa, Produto, Serviço, Departamento)
        ↓
Envia para o motor de IA com contexto de negócio
        ↓
IA retorna sentimento, categorias e keywords por feedback
        ↓
Resultados salvos em feedback_analysis
```

### 2. Gerar Insights Globais
Recalcula o **resumo e as recomendações** com base nos feedbacks já analisados — sem reprocessar tudo do zero. Útil quando novos feedbacks foram analisados e o gestor quer um relatório atualizado.

```
Gestor clica em "Gerar insights"
        ↓
API agrupa todos os feedback_analysis existentes por escopo
        ↓
IA gera sumário situacional + recomendações consolidadas
        ↓
Resultados salvos em feedback_insights_report
        ↓
Painel exibe o relatório atualizado
```

---

## Seletor de Escopo

O painel usa um **seletor radial animado** para escolher qual escopo visualizar:

| Escopo | Cor | Disponível quando |
|---|---|---|
| Empresa | Indigo | Sempre |
| Produto | Verde | `uses_company_products = true` **e** ≥ 1 item cadastrado |
| Serviço | Âmbar | `uses_company_services = true` **e** ≥ 1 item cadastrado |
| Departamento | Rosa | `uses_company_departments = true` **e** ≥ 1 item cadastrado |

Cada escopo tem seu próprio relatório independente.

---

## Importância e Impacto

| Aspecto | Impacto |
|---|---|
| **Escala** | Processa dezenas ou centenas de feedbacks em segundos |
| **Contexto de negócio** | O relatório é personalizado com os dados da empresa (objetivo, segmento, produtos) |
| **Segmentação** | Relatórios separados por escopo permitem comparar áreas da empresa |
| **Decisão gerencial** | Recomendações geradas diretamente aplicáveis sem interpretação adicional |
| **Assincronismo** | O processamento não bloqueia a experiência do cliente durante a coleta |

---

## O Que o Relatório Contém

```json
{
  "scope_type": "PRODUCT",
  "catalog_item_name": "Hambúrguer Artesanal",
  "analyzedCount": 47,
  "sentimentDistribution": {
    "positive": 34,
    "neutral": 8,
    "negative": 5
  },
  "topKeywords": ["saboroso", "porção", "demora", "apresentação"],
  "topCategories": ["qualidade do produto", "tempo de espera"],
  "globalInsights": {
    "summary": "A maioria dos clientes avalia positivamente o sabor e a apresentação, mas há reclamações recorrentes sobre o tempo de espera nos horários de pico.",
    "recommendations": [
      "Reforçar equipe de cozinha nos horários de maior movimento",
      "Manter o padrão de apresentação atual — é um diferencial percebido"
    ]
  }
}
```

---

## Detalhes Técnicos

- Mínimo de **10 feedbacks** para iniciar análise relevante (retorna 422 se insuficiente)
- `collecting_data` da empresa deve estar preenchido — objetivo e resumo são usados no prompt da IA
- Os dois botões ficam desabilitados enquanto uma operação está em andamento (sem duplo disparo)
- O processamento ocorre em batches de até 50 feedbacks por execução (máx. 100)

---

## Referência Técnica

- [Motor de IA com Filtro Semântico → filtro-semantico-ia.md](./filtro-semantico-ia.md)
- [Serviço IA Analyze](../servicos/ia-analyze/visao-geral.md)
- [Endpoints de Análise IA](../backend/endpoints.md)
