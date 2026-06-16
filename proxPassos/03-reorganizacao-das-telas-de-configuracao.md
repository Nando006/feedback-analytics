# 03 — Reorganização das telas de configuração

| Campo | Valor |
|---|---|
| **Status** | 🔵 Em planejamento ativo (frente prioritária) |
| **Esforço estimado** | Médio-Alto |
| **Camadas afetadas** | Frontend (navegação, rotas, layout, telas de configuração) |
| **Depende de** | — (pode começar já) |

## Objetivo

Tornar a área logada **autoexplicativa**: o gestor deve, sozinho, saber **onde está**, descobrir **onde fica cada coisa** e completar a configuração da coleta **sem ajuda**.

## Decisões tomadas

- **Foco:** atender os **dois** momentos — onboarding (1ª configuração) e uso recorrente.
- **Profundidade:** **reestruturação ampla** — nova arquitetura de informação, rotas novas (com redirects) e uma camada de orientação (wayfinding) padronizada.

## Documentos deste item

1. **[Análise do estado atual (as-is)](./03-analise-atual-das-telas.md)** — como as telas estão hoje: mapa de navegação, mecânica e problemas organizados por princípio de UX.
2. **[Plano de reorganização (to-be)](./03-plano-de-reorganizacao.md)** — nova arquitetura de informação, wayfinding, reagrupamento das telas, onboarding guiado, esquema de rotas e fases de implementação.
3. **[Fase 1 — tarefas de implementação](./03-fase1-tarefas.md)** — detalhamento acionável da 1ª onda (orientação/wayfinding): tarefas T1–T6, ordem, decisões e *Definition of Done*.

## Frentes relacionadas

- [Item 04 — Preview do formulário](./04-preview-do-formulario.md): encaixa na tela de "Catálogo & perguntas".
- [Item 02 — Feedback por áudio](./02-feedback-por-audio.md): também mexe no formulário (lado da coleta).

## Próximo passo

Validar o plano e, **antes de mexer em rotas**, prototipar no Figma o novo menu, o cabeçalho padrão (`PageHeader`) e o Assistente de configuração — então iniciar pela Fase 1 (orientação/wayfinding).
