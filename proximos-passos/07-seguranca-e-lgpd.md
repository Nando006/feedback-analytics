# 07 — Segurança e LGPD

> **Em uma frase:** Em vez de trocar a tecnologia de login por medo de vazamento, tratamos segurança como gestão de risco — mapeamos onde estão os dados, criamos um plano para reagir a incidentes e documentamos quem é responsável pelo quê perante a lei.

| Campo | Valor |
|---|---|
| **Status** | 🔵 Planejado |
| **Quando** | Mês 5 |
| **Esforço** | Médio |
| **Prioridade** | 🟡 Importante |
| **Depende de** | Ganha urgência com a [05 — Feedback por áudio](./05-feedback-por-audio.md) (passa a haver voz/PII em armazenamento); dialoga com a [08 — Infraestrutura e custo](./08-infraestrutura-e-custo.md) |
| **Camadas afetadas** | Transversal — análise de risco e documentação (não é uma feature de tela; toca banco, infra, autenticação e processos) |

## Para qualquer leitor

Na banca apareceu uma pergunta justa e importante: *"a autenticação está toda no Supabase; e se houver um vazamento de dados, como vocês lidariam com as consequências?"*. Essa pergunta merece uma resposta honesta, e ela tem duas partes — uma que está certíssima e outra que, se seguida ao pé da letra, pioraria a situação.

A parte **certa** é o coração da preocupação: hoje o sistema concentra muita coisa em um único fornecedor (o Supabase guarda o login, os dados das empresas e os feedbacks). E, pela LGPD (a Lei Geral de Proteção de Dados), quem coleta os dados — ou seja, **nós** — é o responsável legal perante o titular e perante a autoridade, mesmo usando um fornecedor terceirizado. Isso não é detalhe: se um dia houver vazamento, a obrigação de avisar as pessoas e o órgão regulador é nossa, não do Supabase.

A parte **enganosa** é a conclusão de que a solução seria "tirar a autenticação do Supabase e fazer a nossa". Na prática, escrever um sistema de login do zero é uma das fontes mais clássicas de falha de segurança que existe — senhas mal guardadas, tokens mal validados, brechas de redefinição de senha. Provedores especializados como o Supabase Auth resolvem isso há anos, com auditoria e correção contínua. Trocar um serviço maduro por código caseiro normalmente **aumenta** o risco, não diminui. É como achar que um cofre fabricado em casa é mais seguro que um cofre de banco só porque está "na nossa mão".

Então a resposta correta não é mudar de tecnologia — é **assumir o risco de forma organizada**. Isso significa três coisas concretas, que esta etapa entrega: (1) mapear qual dado está em qual lugar e o que cada vazamento exporia; (2) ter um plano escrito de como reagir a um incidente — quem avisamos, em quanto tempo, o que falamos; e (3) coletar o mínimo de dados pessoais possível. E aqui há uma boa notícia: **o projeto já faz parte disso hoje**. Existe um mecanismo que "higieniza" o token de login, removendo CPF, documento e telefone dele, e mantendo esses dados apenas no banco, sob trava de acesso por empresa.

## O que muda para quem usa o sistema

- **Para o gestor (empresa cliente):** nada muda na tela do dia a dia. O que muda é a confiança — passamos a ter uma resposta clara e documentada para "o que vocês fazem se meus dados vazarem?", incluindo prazo de aviso e canal de contato.
- **Para o cliente que dá o feedback:** continua anônimo na coleta. A diferença é que, com a higienização do token e a minimização de dados, há menos informação pessoal circulando do que parece à primeira vista.
- **Para a banca e o orientador:** deixa de existir o "ponto cego" de segurança. Em vez de uma resposta improvisada, há um documento de análise de risco, um plano de resposta a incidente e o registro de quem responde pelo quê.
- **Para a equipe (nós):** ganhamos um roteiro pronto para o pior dia. Em um incidente real, ninguém improvisa sob pressão — segue-se o passo a passo já escrito.

## Como vai funcionar

Esta etapa **não é código de tela** — é trabalho de análise e documentação que blinda o projeto e responde diretamente à banca. O fluxo é entender o risco, planejar a reação e provar que já minimizamos dados.

**Antes (situação atual):**

- A segurança existe de fato (login terceirizado robusto, isolamento por empresa, token higienizado), mas está **espalhada e não declarada**. Se a banca perguntar "e se vazar?", a resposta é improvisada.
- Não há um inventário escrito de "que dado mora onde".
- Não há plano de resposta a incidente nem registro formal de responsabilidade legal.

**Depois (com esta etapa):**

- Existe um **mapa de ameaças** simples: para cada parte do sistema, o que poderia dar errado e o que isso exporia.
- Existe um **plano de resposta a incidente** (um "manual do bombeiro"): se vazar, fazemos A, B, C, avisamos a ANPD (autoridade) e os titulares em prazo definido.
- Está **escrito e provado** que somos o "controlador" e o Supabase é o "operador" — e o que cada um faz.
- A **minimização de dados** que já existe no código vira evidência formal, não folclore de corredor.

## Por dentro — detalhes técnicos

> Esta seção é para a equipe de desenvolvimento; quem não é da área pode pular.

Esta etapa produz **três entregáveis de documentação** mais um reforço de configuração. Nada aqui exige reescrever a stack.

**1. Documento de modelagde de ameaças (threat model — STRIDE simplificado).**
Para cada superfície relevante (formulário público anônimo, API gateway, banco Supabase, serviço de IA, storage de áudio da etapa 05), classificar ameaças nas seis categorias STRIDE — Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege — e registrar a mitigação existente ou planejada. Âncoras reais no código que já mitigam:
- **Information disclosure / minimização:** o trigger `clean_user_metadata_before_change` (`database/sql/functions/public/clean_user_metadata_before_change__0aa1f366fd.sql`) remove do `raw_user_meta_data` as chaves `phone`, `document`, `company_name`, `account_type`, `terms_version`, `terms_accepted_at`, `email` — logo, esses dados **não entram no JWT**. O JWT só carrega claims seguros via `jwt_custom_claims` (`role` + `enterprise_id`). Documentado em [`docs/funcionalidades/higienizacao-jwt-lgpd.md`](../../docs/funcionalidades/higienizacao-jwt-lgpd.md).
- **Elevation of privilege / isolamento multi-tenant:** RLS habilitada nas 13 tabelas, com policies do tipo `enterprise_id IN (SELECT id FROM enterprise WHERE auth_user_id = auth.uid())` (ver `database/sql/policies/all_policies.sql`). Mesmo com um token comprometido, o titular só alcança a própria empresa.
- **Spoofing:** login delegado ao Supabase Auth (provedor especializado), não a código próprio.

**2. Runbook de resposta a incidente.**
Passo a passo acionável: detecção → contenção → avaliação de impacto → notificação. Sob a LGPD (art. 48), o **controlador** deve comunicar a ANPD e os titulares em prazo razoável. O runbook fixa: quem é o ponto de contato, como revogar sessões (rotação de chaves Supabase, invalidação de JWT), como preservar logs para apuração, e o template de comunicação aos titulares. Incluir o caso específico da etapa 05 (vazamento de áudio = voz, que é dado biométrico/sensível → tratamento e aviso mais rigorosos).

**3. Registro do modelo de responsabilidade compartilhada (controlador/operador).**
Tabela formal: **nós = controlador** (decidimos o que coletar e por quê), **Supabase = operador** (processa por nossa conta), **Google Gemini / provedor de LLM = operador** (recebe texto de feedback para análise — atenção ao que é enviado). Mapear obrigações de cada um e o que está coberto pelos termos de cada fornecedor.

**4. Reforço de configuração (least-privilege, criptografia em repouso, backups).**
- **Criptografia em repouso e backups:** confirmar e documentar que o Postgres gerenciado do Supabase aplica encryption-at-rest e backups automáticos; definir política de retenção.
- **Least-privilege:** auditar uso de `SECURITY DEFINER` (presente em várias funções PL/pgSQL) e o privilégio OWNER da view `public.enterprise_public` — garantir que expõem só o necessário (a view já filtra para dados públicos). Conferir que as chaves de serviço (service role) não vazam para o frontend.

## Riscos e decisões em aberto

- **Decisão em aberto — autenticação própria:** trocar o Supabase Auth por uma biblioteca de auth self-hosted (ex.: Lucia, Better Auth) **só faz sentido se** o projeto for para self-host total (ver [08 — Infraestrutura e custo](./08-infraestrutura-e-custo.md)). Fora desse cenário, a recomendação é **manter o Supabase Auth** — é mais seguro que login caseiro. Esta decisão fica explicitamente vetada como reação à pergunta da banca, e justificada por escrito.
- **Documentação sem teste vira ficção:** um runbook nunca exercitado pode falhar no dia real. Mitigação: fazer ao menos um "ensaio de mesa" (tabletop) simulando um vazamento.
- **A higienização do JWT depende do trigger estar sempre ativo:** se o trigger for desabilitado numa migração futura, a minimização quebra silenciosamente. Mitigação: incluir no threat model e validar em teste.
- **Dado enviado à IA é dado que sai da nossa fronteira:** o texto do feedback vai para o provedor de LLM (operador). Decisão em aberto: anonimizar/filtrar PII antes de enviar (dialoga com a [04 — Provedor de LLM configurável](./04-provedor-de-llm-configuravel.md)).
- **Escopo de TCC:** isto é análise de risco, não uma certificação ISO. O objetivo é demonstrar maturidade e método, não atingir conformidade auditável de produção.

## Como vamos saber que deu certo

- [ ] Documento de threat model (STRIDE simplificado) escrito, cobrindo as superfícies: formulário anônimo, API gateway, banco, serviço de IA e storage de áudio.
- [ ] Para cada ameaça listada, há uma mitigação existente (com âncora no código) ou planejada.
- [ ] Runbook de resposta a incidente escrito, com prazos, ponto de contato, passos de contenção e template de comunicação à ANPD e aos titulares.
- [ ] Registro do modelo controlador/operador concluído, com o papel de Supabase, Gemini e demais fornecedores.
- [ ] A minimização de dados existente está documentada e validada por teste (CPF/documento/telefone comprovadamente fora do JWT).
- [ ] Decisão sobre autenticação registrada por escrito (manter Supabase Auth, com justificativa), respondendo diretamente à banca.
- [ ] Criptografia em repouso, política de backup e least-privilege confirmados e documentados.

## Etapas de entrega

1. **Inventário de dados (data map):** listar qual dado pessoal existe, onde mora e por quê — base para todo o resto.
2. **Threat model (STRIDE simplificado):** ameaças por superfície + mitigações; aproveitar a higienização do JWT e a RLS já existentes como evidência.
3. **Modelo de responsabilidade controlador/operador:** tabela formal dos papéis e obrigações de cada fornecedor.
4. **Runbook de resposta a incidente:** o "manual do bombeiro", com prazos LGPD e templates.
5. **Reforço e validação técnica:** auditar least-privilege/`SECURITY DEFINER`, confirmar criptografia/backup, e cobrir a minimização com um teste automatizado.
6. **Ensaio de mesa (tabletop):** simular um vazamento e rodar o runbook uma vez para achar lacunas.

## O que isso demonstra no TCC

- **Análise de risco de segurança:** uso de uma metodologia reconhecida (STRIDE) aplicada a um sistema real, não apenas teoria.
- **LGPD na prática:** papéis de controlador e operador, obrigação de notificação (art. 48), e o princípio da **minimização de dados** demonstrado em código que já roda.
- **Modelo de responsabilidade compartilhada:** entendimento maduro de que terceirizar infraestrutura **não** terceiriza a responsabilidade legal — e por que, ainda assim, terceirizar autenticação é a escolha mais segura.
- **Pensamento crítico perante a banca:** capacidade de validar o núcleo correto de uma crítica e, com argumento técnico, refutar a conclusão equivocada.

## Relacionado

- [⟵ Roadmap geral](./README.md)
- [05 — Feedback por áudio](./05-feedback-por-audio.md) — introduz dado de voz (biométrico/sensível) e storage, elevando o risco que esta etapa endereça
- [08 — Infraestrutura e custo](./08-infraestrutura-e-custo.md) — único cenário em que a autenticação própria voltaria à mesa (self-host total)
- [04 — Provedor de LLM configurável](./04-provedor-de-llm-configuravel.md) — relação com o dado que sai para o operador de IA
- [Higienização de dados sensíveis no JWT (LGPD)](../../docs/funcionalidades/higienizacao-jwt-lgpd.md) — mecanismo de minimização já implementado
