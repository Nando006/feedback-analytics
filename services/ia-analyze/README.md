# IA Analyze Service

Servico remoto de dominio de IA para execucao independente do gateway principal.

## Endpoints internos

- `GET /internal/health`
- `GET /internal/ia-analyze/health`
- `POST /internal/ia-analyze/analyze`

## Payload de analise

```json
{
	"enterprise_context": {
		"enterprise_name": "Empresa Exemplo",
		"company_objective": "Melhorar experiencia do cliente",
		"analytics_goal": "Identificar causas de insatisfacao",
		"business_summary": "Rede de atendimento com produtos e servicos",
		"main_products_or_services": ["Produto A", "Servico B"]
	},
	"batches": [
		{
			"scope_type": "COMPANY",
			"catalog_item_id": null,
			"catalog_item_name": null,
			"feedbacks": []
		}
	]
}
```

## Variaveis de ambiente

- `GEMINI_API_KEY`
- `IA_ANALYZE_INTERNAL_TOKEN` (opcional, para validar chamadas internas)

## Execucao local

Executar na raiz do repositorio:

```bash
npm run server:ia-analyze:dev
```