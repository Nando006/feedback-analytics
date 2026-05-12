# Funcionalidades — Visão Geral

> O Feedback Analytics oferece três capacidades centrais: **coletar**, **analisar** e **visualizar** feedbacks de clientes.

## Mapa de Funcionalidades

| Funcionalidade | Quem usa | Documentação |
|---|---|---|
| Coleta via QR Code | Cliente final | [qrcode-empresa.md](./qrcode-empresa.md) |
| Catálogo de Feedback | Empresa | [catalogo-feedback.md](./catalogo-feedback.md) |
| Análise IA de Feedbacks | Empresa | [insights-ia.md](./insights-ia.md) |
| Insights por Escopo | Empresa | [insights-ia.md](./insights-ia.md) |

---

## Coleta via QR Code

A empresa cadastra seus itens de catálogo e o sistema gera **QR Codes únicos** por item. O cliente escaneia, avalia e submete — sem login, sem app instalado.

[Ver detalhes → Catálogo de Feedback](./catalogo-feedback.md)

---

## Análise Inteligente por IA

Os feedbacks coletados são enviados ao pipeline de IA (Google Gemini) que retorna automaticamente:

- **Sentimento**: `positive`, `neutral` ou `negative`
- **Palavras-chave**: termos mais relevantes da mensagem
- **Categorias**: agrupamentos semânticos
- **Global Insights**: sumário e recomendações por escopo de análise

[Ver detalhes → Análise IA](./insights-ia.md)

---

## Painel de Insights

O painel de insights (`/user/insights/reports`) permite:

1. Selecionar o escopo via seletor radial animado (Empresa / Produto / Serviço / Departamento)
2. Executar análise de feedbacks brutos novos
3. Regenerar insights globais com base nos feedbacks já analisados
4. Visualizar relatório com sentimentos, recomendações e resumo

[Ver endpoints relacionados → Backend Endpoints](../backend/endpoints.md)
