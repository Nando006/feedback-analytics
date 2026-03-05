# Benchmark de Performance — Onda 3

Este guia define um protocolo simples e repetível para medir fluidez das telas de catálogo e QR Code.

## Objetivo

- Garantir experiência fluida ao **digitar** e ao **scrollar** com listas grandes (>100 itens).
- Validar que otimizações reduziram custo de render e chamadas de rede sem quebrar fluxo funcional.

## Escopo medido

- `pages/user/edit/editCollectingData.tsx`
- `components/user/pages/profile/editCollectingData/formCollectingDataEnterprise.tsx`
- `components/user/pages/profile/editCollectingData/fields/fieldCatalogItems.tsx`
- `pages/user/qrcodes/qrcodeProducts.tsx`
- `pages/user/qrcodes/qrcodeServices.tsx`
- `pages/user/qrcodes/qrcodeDepartments.tsx`
- `components/user/pages/qrcodeCatalog/QrCodeCatalogPage.tsx`

## Ambiente de medição

- Navegador: Chrome (aba anônima, extensões desativadas)
- DevTools: Performance + Network
- Build local: `npm run dev:all`
- CPU throttling: sem throttling para baseline local

## Cenários de teste

### 1) Digitação no catálogo (coleta)

1. Acessar tela de edição de coleta.
2. Marcar as 3 categorias (produtos/serviços/departamentos).
3. Criar no mínimo 100 itens em uma categoria.
4. Digitar continuamente por 10 segundos no campo `Nome` de um item no meio da lista.

**Coletar:**
- Long tasks no Performance (ms)
- FPS médio durante digitação
- Quantidade de commits/renders do componente de lista

### 2) Scroll em grade de QR com lista grande

1. Acessar QR de produtos/serviços/departamentos com +100 itens ativos.
2. Scroll contínuo do topo ao final da página e retorno ao topo.

**Coletar:**
- FPS médio de scroll
- Tempo de scripting/layout/painting
- Total de requests de imagem QR disparadas ao abrir a tela vs durante scroll

### 3) Toggle de QR por item

1. Em uma lista grande, alternar ativar/desativar em 5 itens diferentes.
2. Repetir alternância rápida em 1 item específico.

**Coletar:**
- Tempo até estado visual atualizado (ms)
- Quantidade de requisições por toggle
- Se há bloqueio de outros botões sem necessidade

## Critérios de aceite

- Digitação sem atraso perceptível (sem travamento contínuo).
- Scroll sem engasgos severos em listas >100 itens.
- Toggle atualiza só o item afetado e não recarrega contexto global da rota `/user`.
- Nenhuma regressão funcional no submit de coleta e no fluxo de QR.

## Regressão obrigatória

- `npm run build`
- `npx vitest run src/routes/actions/actionCollectingData.test.ts`

## Checklist de evidências

- [ ] Captura Performance (digitação)
- [ ] Captura Performance (scroll)
- [ ] Captura Network (toggle)
- [ ] Build verde
- [ ] Teste de regressão verde

## Observações de manutenção

- Preferir otimizações locais e previsíveis (memoização e lazy render por viewport).
- Evitar abstrações complexas sem necessidade.
- Qualquer nova otimização deve preservar padrão loader/action/service já adotado.
