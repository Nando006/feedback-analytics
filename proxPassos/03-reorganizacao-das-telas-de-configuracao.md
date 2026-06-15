# 03 — Reorganização das telas de configuração

| Campo | Valor |
|---|---|
| **Status** | 🟡 Planejado |
| **Esforço estimado** | Médio-Alto |
| **Camadas afetadas** | Frontend (navegação, telas de `edit/*` e `profile`) |
| **Depende de** | — (pode começar já) |

## Objetivo

Hoje é **difícil para o gestor encontrar** onde se faz a configuração — principalmente **ativar o catálogo de itens** e **definir as perguntas do formulário**. As telas estão espalhadas, com nomes técnicos, e a mesma tarefa (perguntas) aparece em dois lugares diferentes. A meta é reorganizar a navegação e o agrupamento das telas para que o caminho "configurar a coleta" seja **óbvio e linear**.

## Como funciona hoje (mapa atual)

Rotas logadas em `apps/web/src/routes/user.tsx`; menu em `apps/web/src/lib/mock/menu.ts` (renderizado por `apps/web/components/user/layout/Menu.tsx`).

**O menu mostra:** Perfil · Catálogo · Dashboard · Feedbacks (Recebidos / Analisados) · Insights (Relatórios / Emocional / Estatísticas).

O fluxo de configuração real, porém, é este — e boa parte **não aparece no menu**:

```
/user/profile ......................... dados pessoais + dados da empresa
  │                                      + perguntas GLOBAIS + QR geral da empresa
  └─(link no header)→ /user/edit/types-feedback ....... ATIVA Produtos/Serviços/Departamentos
        │  (o link "Configurar catálogo" só aparece DEPOIS de salvar)
        └→ /user/edit/feedback-settings ............... HUB (cards por tipo ativado)
              └→ /user/edit/feedback-products|services|departments
                    ├─ adiciona itens do catálogo
                    ├─ (por item) perguntas ESPECÍFICAS do item
                    └─ (por item) ativa/desativa o QR daquele item
```

Arquivos-chave:
- Ativar tipos: `apps/web/pages/user/edit/editTypeFeedbacks.tsx` + `…/editTypesFeedback/formTypesFeedback.tsx`.
- Hub de catálogos: `apps/web/pages/user/edit/editFeedbackSettings.tsx`.
- Catálogo + perguntas por item + QR por item: `…/editFeedbackSettings/formFeedbackCatalog.tsx` e `…/editCollectingData/fields/fieldCatalogItems.tsx`.
- Perguntas globais da empresa: `…/questionsDinamic/questionDinamicEnterprise.tsx` (dentro de `/user/profile`).
- QR geral da empresa: `apps/web/pages/user/qrcodes/qrcodeEnterprise.tsx`.

## Pontos de confusão (diagnóstico)

1. **O menu não expõe a configuração.** "Tipos de Feedback", "Perguntas" e o "QR geral" não estão no menu — chega-se a eles por links dentro de outras telas.
2. **Nomes técnicos vazando para a UI/rotas.** `feedback-settings`, `collecting-data-enterprise`, `types-feedback` não comunicam o que fazem ("Collecting Data" = "Dados da Empresa").
3. **"Catálogo" ambíguo.** No menu, "Catálogo" leva a um **hub** que redireciona para outras três telas — o gestor se perde na hierarquia.
4. **Perguntas em dois lugares com nomes parecidos.** Perguntas **globais** ficam em `/user/profile`; perguntas **por item** ficam dentro do catálogo — componentes diferentes (`QuestionDinamicEnterprise` vs `QuestionAccordion`) e sem deixar claro a diferença "global × por item".
5. **Descoberta condicional.** Em "Tipos de Feedback", o link para configurar o catálogo só **aparece depois de salvar** — quem não salva acha que não há próximo passo.
6. **QR fragmentado.** QR geral tem tela própria; QR por item fica embutido no catálogo (e há rotas `/user/qrcode/products|services|departments` que são só action, sem tela).
7. **Dois botões "salvar" por item.** Salvar o item e salvar as perguntas do item são ações separadas — dá a impressão de que algo não foi salvo.

## Direções de reorganização

> Direções, não design final — o desenho definitivo deve passar por protótipo (Figma) e validação. O importante é o **agrupamento lógico** e a **descoberta**.

- **Criar uma seção "Configuração" explícita no menu**, reunindo, em ordem de uso: Dados da Empresa → Tipos de Feedback → Catálogos → Perguntas → QR Codes. Isso sozinho já resolve boa parte da dor de "onde fica".
- **Tratar a configuração como um fluxo guiado** (wizard ou hub com indicador de progresso: "Dados ✓ · Tipos ✓ · Catálogo ○ · Perguntas ○ · QR ○"), já que os passos têm dependência real entre si.
- **Unificar a edição de perguntas** num único lugar, separando visualmente "Perguntas padrão (todos os itens)" de "Perguntas por tipo/item". Idealmente um componente único de pergunta parametrizado por escopo, no lugar dos dois atuais.
- **Centralizar os QR Codes** numa tela só (geral + por item), em vez de espalhados; aposentar as rotas-action vazias.
- **Revisar a nomenclatura** de rótulos e rotas para linguagem de produto (ex.: "Dados da Empresa", "Tipos de Feedback", "Catálogos", "Perguntas", "QR Codes").
- **Tornar o próximo passo sempre visível** (não esconder o link de catálogo atrás do "salvar"; usar toast + navegação sugerida).
- **Encaixar aqui o preview do formulário** descrito no [item 04](./04-preview-do-formulario.md): configurar e ver ao mesmo tempo reduz muito a confusão.

## Mudanças técnicas por camada (frontend)

- **Navegação:** reestruturar `apps/web/src/lib/mock/menu.ts` (e o render em `Menu.tsx`/`Sidebar.tsx`) para incluir a seção "Configuração".
- **Rotas:** introduzir caminhos mais claros em `apps/web/src/routes/user.tsx` (ex.: `/user/config/...`). Manter redirects das rotas antigas para não quebrar QR Codes/links já impressos.
- **Componentização:** consolidar `QuestionDinamicEnterprise` + `QuestionAccordion` num componente de perguntas reutilizável parametrizado por escopo.
- **Telas de QR:** uma tela central de QR Codes; remover/redirecionar as rotas-action `qrcode/products|services|departments`.
- **Sem mudança de backend obrigatória:** a reorganização é majoritariamente de IA (arquitetura de informação) e frontend; os endpoints e o modelo de dados continuam os mesmos.

## Riscos e decisões em aberto

- **Compatibilidade de URLs:** QR Codes já distribuídos apontam para rotas públicas de coleta (não para as telas de config), então a reorganização interna é segura — mas **manter redirects** das rotas logadas antigas evita quebrar links/bookmarks do gestor.
- **Escopo do redesenho:** decidir entre uma reorganização incremental (mexer no menu + agrupar) ou um wizard novo de configuração. A primeira entrega valor rápido; a segunda resolve melhor o onboarding.
- **Validar com usuário real:** a dor é de usabilidade — protótipo + teste com um gestor antes de codar o fluxo final.
- **Alinhar a documentação:** ao mudar rotas/nomes, atualizar [UC-06](../docs/casos-de-uso/uc-06-ativacao-tipos-feedback.md), [UC-07](../docs/casos-de-uso/uc-07-configuracao-catalogo.md) e os protótipos em `docs/figma/`.

## Esboço de fases

1. **Fase 1 — Ganho rápido:** seção "Configuração" no menu + revisão de rótulos/nomes + tornar o "próximo passo" sempre visível. Baixo risco, alto retorno de descoberta.
2. **Fase 2 — Unificar perguntas e QR:** um lugar só para perguntas (global × por item) e uma tela central de QR Codes.
3. **Fase 3 — Fluxo guiado + preview:** wizard/hub com progresso e o preview ao vivo do [item 04](./04-preview-do-formulario.md).
