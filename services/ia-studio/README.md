# IA Studio Google Service

Servico remoto de dominio de IA para execucao independente do gateway principal.

## Endpoints internos

- `GET /internal/health`
- `GET /internal/ia-studio/health`
- `POST /internal/ia-studio/analyze`

## Payload de analise

```json
{
	"user_id": "uuid-do-usuario",
	"options": {
		"limit": 50,
		"scope_type": "COMPANY",
		"catalog_item_id": "uuid-opcional"
	}
}
```

## Variaveis de ambiente

- `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `IA_STUDIO_INTERNAL_TOKEN` (opcional, para validar chamadas internas)

## Execucao local

Executar na raiz do repositorio:

```bash
npm run server:ia-studio:dev
```