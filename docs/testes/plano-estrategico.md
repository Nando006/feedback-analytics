# Plano de Teste Estratégico — feedback-analytics

**Sistema:** feedback-analytics (SaaS de Coleta de Feedbacks via QR Code com IA)
**Versão do Documento:** 1.0

---

## Fase 1: Plano de Teste Estratégico (Teórico)

---

### 1. Introdução e Escopo

#### 1.1. Introdução

O feedback-analytics é um SaaS destinado a negócios — pessoa física (CPF) ou jurídica (CNPJ) — que precisam coletar e interpretar avaliações de clientes de forma estruturada. O sistema resolve dois problemas centrais: **como coletar feedback com granularidade** (por empresa, produto, serviço ou departamento via QR Code físico) e **como transformar esse volume em decisões** sem que o gestor precise ler cada avaliação individualmente (via análise de IA).

A plataforma possui três atores distintos:

- **Empresa** (novo cliente) — realiza o cadastro e ativa a conta.
- **Gestor** — configura a coleta, distribui os QR Codes e analisa os resultados no dashboard.
- **Cliente do estabelecimento** — escaneia o QR Code e submete a avaliação pelo formulário público.

Stack técnica: React 19 SPA com React Router v7, Supabase (autenticação + banco de dados), API Gateway Node.js e Microsserviço de IA em Python.

#### 1.2. Escopo do Teste

**EM ESCOPO:**

- Fluxo de cadastro, ativação de conta e autenticação (UC-01, UC-02, UC-03)
- Configuração da coleta: tipos de feedback, catálogo de itens, perguntas dinâmicas e contexto de IA (UC-06, UC-07, UC-08)
- Envio de feedback via QR Code — formulário público acessado pelo cliente (UC-04)
- Controle e distribuição de QR Code (ativar/desativar, download, copiar link, compartilhar) (UC-05)
- Dashboard com métricas, gráficos e últimos feedbacks (UC-09)
- Listagem de feedbacks com filtros combinados e modal de detalhes (UC-10)
- Disparo de análise de IA e visualização de relatório, análise emocional e estatísticas (UC-11)
- Gestão de perfil: nome, e-mail, telefone e perguntas dinâmicas da empresa (UC-12)
- Mecanismo anti-spam por fingerprint de dispositivo (bloqueio de envios duplicados no mesmo dia)

**FORA DO ESCOPO:**

- Testes de carga e estresse (múltiplos envios de QR Code simultâneos em pico)
- Testes de acessibilidade visual detalhados (WCAG)
- Testes end-to-end do fluxo de e-mail (confirmação de conta, link de reset) — requerem acesso a caixa de e-mail real em tempo de execução
- Testes de integração direta com provedores externos de IA (OpenAI/Anthropic)
- Testes de gateway de pagamento

---

### 2. Estratégia de Teste

#### 2.1. Níveis de Teste

- **Teste de Unidade:** Foco nas funções puras de validação (CPF/CNPJ, telefone, comprimento de perguntas 20–150 chars), funções de transformação (formatação de data, truncamento de texto, geração de fingerprint) e lógica das route actions (parsing de FormData, retorno de erros). Responsável: Desenvolvedores. Ferramenta: **Vitest** (já em uso no projeto).

- **Teste de Integração:** Verificação de que as camadas loader → service → API Gateway retornam dados com o contrato esperado; que as actions processam FormData e acionam os serviços corretos; e que o fluxo de autenticação Supabase + cookie funciona de ponta a ponta. Responsável: Engenharia/QA.

- **Teste de Sistema (E2E):** Navegação completa pelos 12 casos de uso documentados, simulando o comportamento real dos três atores. Cobre caminho feliz e as exceções críticas de cada UC. Responsável: QA. Ferramenta: **Playwright** (a implementar).

- **Teste de Aceitação (UAT):** Realizado por gestores reais em ambiente de homologação, validando se os fluxos de configuração → coleta → análise refletem as necessidades reais do negócio.

#### 2.2. Abordagens de Teste

- **Caixa-Branca:** Aplicada nos testes de unidade com cobertura via `@vitest/coverage-v8`. Objetivo: garantir que cada branch das funções de validação e das route actions seja exercitado, evitando comportamentos silenciosos em casos de borda.

- **Caixa-Cinza:** Aplicada nos testes de integração entre as camadas do frontend (loader/action) e a API. Conhecemos o contrato da API e os tipos esperados, mas testamos o comportamento observável — não o código interno do backend.

- **Caixa-Preta:** Aplicada nos testes E2E, simulando exatamente o que cada ator faz na interface: Empresa realiza cadastro, Gestor configura e analisa, Cliente submete feedback. Nenhum conhecimento do código interno é usado — apenas entradas e saídas visíveis.

---

### 3. Recursos e Ambiente

**Ferramentas:**

| Finalidade | Ferramenta | Status |
|---|---|---|
| Testes de unidade e componentes | Vitest + @vitest/coverage-v8 | Em uso |
| Testes E2E de interface | Playwright | A implementar |
| Mock de API em testes de integração | MSW (Mock Service Worker) | A implementar |
| Gerenciamento de casos de teste | Casos de Uso em `docs/casos-de-uso/` | Em uso |

**Ambiente de Teste:**

Um ambiente de homologação espelhado na produção (branch `homolog` no Vercel), conectado a um banco de dados Supabase separado do production. O ambiente deve conter:

- Uma empresa de teste criada, conta ativada e com gestor autenticado.
- Tipos de feedback ativados (Produtos, Serviços e Departamentos).
- Catálogo com ao menos 1 item ativo por tipo, com QR Code ativo.
- Contexto de IA preenchido (os 3 campos obrigatórios: objetivo, objetivo analítico, resumo).
- Mínimo de 10 feedbacks coletados para viabilizar os testes de insights.

---

### 4. Critérios de Qualidade

**Critérios de Entrada:**

- Ambiente de homologação estável e acessível.
- Massa de dados configurada conforme descrito na seção de Ambiente.
- Deploy da versão a ser testada concluído sem erros de build.

**Critérios de Saída:**

- 100% dos cenários de caminho feliz dos 12 UCs executados com sucesso.
- Zero bugs de bloqueio nos fluxos de autenticação e coleta de feedback (UC-01, UC-02, UC-04, UC-05).
- Cobertura de código ≥ 80% nas funções de validação (testes de unidade).
- Todos os bugs críticos identificados registrados e com responsável atribuído.

---

### 5. Gestão de Riscos

| Risco | Probabilidade | Impacto | Ação de Mitigação |
|---|---|---|---|
| **Anti-spam bloqueando testes E2E** — o fingerprint do dispositivo de teste é reconhecido após o primeiro envio do dia, impedindo novos envios no mesmo ciclo de testes | Alta | Alto | Gerar um fingerprint UUID aleatório por execução de teste, ou executar scripts de limpeza da tabela de dispositivos no banco de homologação antes de cada suíte |
| **Fluxo de e-mail inacessível em automação** — confirmação de conta e reset de senha exigem acesso à caixa de e-mail em tempo real, inviável em pipelines automatizados | Média | Alto | Configurar Mailtrap ou serviço equivalente no ambiente de homologação; testar as telas de sucesso/erro do fluxo sem clicar no link real |
| **Instabilidade do provedor de IA externo** — indisponibilidade bloqueia completamente os testes de UC-11 | Baixa | Alto | Criar mocks das respostas de IA para testes unitários e de integração; marcar os testes E2E de UC-11 como opcionais no pipeline de CI quando o provedor estiver indisponível |
| **Estado sujo entre execuções de teste** — empresa de teste acumula catálogos, tipos e feedbacks de execuções anteriores, causando resultados inconsistentes | Alta | Médio | Implementar scripts de setup/teardown que restauram o estado inicial da empresa de teste antes de cada suíte E2E |

---

## Fase 2: Casos de Teste por Funcionalidade

> Cada CT mapeia 1:1 para um cenário da seção "Base para Teste E2E" do UC correspondente. O UC define **O QUÊ** testar (regra de negócio, fluxo, exceções); esta fase define **COMO EXECUTAR** (passos, dados, resultado esperado).

---

### Grupo 1: Onboarding e Autenticação

#### [UC-01] Cadastro de Conta Empresarial → [uc-01-cadastro-conta.md](../casos-de-uso/uc-01-cadastro-conta.md)

| ID | Título | Pré-condições | Passos de Execução | Dados de Teste | Resultado Esperado |
|---|---|---|---|---|---|
| CT-UC01-01 | Caminho feliz | E-mail ainda não cadastrado | 1. Acessar tela de cadastro. 2. Preencher nome, e-mail, senha, CPF válido, telefone BR, aceitar termos. 3. Clicar "Criar conta". | e-mail: `novo@teste.com`; CPF: `529.982.247-25` | Tela de sucesso com orientação para confirmar o e-mail |
| CT-UC01-02 | E-mail duplicado (Caminho Alternativo) | E-mail já cadastrado | 1. Acessar tela de cadastro. 2. Preencher com e-mail já existente e dados válidos. 3. Clicar "Criar conta". | e-mail: `gestor@empresateste.com` (já existente) | Tela de sucesso exibida normalmente — sem revelar que o e-mail já existe |
| CT-UC01-03 | Documento inválido (Exceção) | Nenhuma | 1. Acessar tela de cadastro. 2. Preencher todos os campos com CPF inválido. 3. Clicar "Criar conta". | CPF: `111.111.111-11` (não passa na validação matemática) | Envio bloqueado; mensagem indicando que o documento é inválido |
| CT-UC01-04 | Telefone inválido (Exceção) | Nenhuma | 1. Acessar tela de cadastro. 2. Preencher telefone fora do padrão BR. 3. Clicar "Criar conta". | Telefone: `12345` | Envio bloqueado; campo destacado com mensagem de formato inválido |
| CT-UC01-05 | Termos não aceitos (Exceção) | Nenhuma | 1. Acessar tela de cadastro. 2. Preencher todos os campos válidos sem marcar os termos. 3. Clicar "Criar conta". | Checkbox de termos: desmarcado | Envio bloqueado; formulário não submetido |
| CT-UC01-06 | Reenvio de e-mail (Caminho Alternativo) | Conta criada, e-mail não confirmado | 1. Na tela de sucesso ou login, solicitar reenvio do e-mail de confirmação. | — | Confirmação de envio exibida; nenhum erro |

#### [UC-02] Login da Empresa → [uc-02-login.md](../casos-de-uso/uc-02-login.md)

| ID | Título | Pré-condições | Passos de Execução | Dados de Teste | Resultado Esperado |
|---|---|---|---|---|---|
| CT-UC02-01 | Caminho feliz | Conta ativa com e-mail confirmado | 1. Acessar tela de login. 2. Preencher e-mail e senha corretos. 3. Clicar "Entrar". | e-mail: `gestor@empresateste.com`; senha correta | Sessão criada; redirecionamento para o dashboard |
| CT-UC02-02 | Credenciais inválidas (Exceção) | Conta ativa | 1. Acessar tela de login. 2. Preencher e-mail válido e senha errada. 3. Clicar "Entrar". | e-mail: `gestor@empresateste.com`; senha: `senhaerrada123` | Mensagem de erro sem revelar qual campo está incorreto; sem redirecionamento |
| CT-UC02-03 | Rate limit (Exceção) | Nenhuma | 1. Acessar tela de login. 2. Tentar login com credenciais erradas 5 ou mais vezes consecutivas. | e-mail válido; senha errada (repetir) | Mensagem de bloqueio temporário exibida |
| CT-UC02-04 | Campos vazios (Exceção) | Nenhuma | 1. Acessar tela de login. 2. Clicar "Entrar" sem preencher nenhum campo. | e-mail: `""`; senha: `""` | Campos destacados como obrigatórios; envio bloqueado antes de chamar a API |

#### [UC-03] Recuperação de Senha → [uc-03-recuperacao-senha.md](../casos-de-uso/uc-03-recuperacao-senha.md)

| ID | Título | Pré-condições | Passos de Execução | Dados de Teste | Resultado Esperado |
|---|---|---|---|---|---|
| CT-UC03-01 | Caminho feliz | Conta ativa com e-mail válido | 1. Acessar tela de recuperação. 2. Informar e-mail cadastrado. 3. Clicar "Enviar". 4. Abrir e-mail e clicar no link. 5. Definir nova senha e confirmar. | e-mail: `gestor@empresateste.com`; nova senha: válida | Senha redefinida; redirecionamento para login com acesso bem-sucedido pela nova senha |
| CT-UC03-02 | E-mail inexistente (Caminho Alternativo) | Nenhuma | 1. Acessar tela de recuperação. 2. Informar e-mail não cadastrado. 3. Clicar "Enviar". | e-mail: `naoexiste@xyz.com` | Mesma mensagem genérica de sucesso — sem revelar que o e-mail não existe |
| CT-UC03-03 | Link expirado (Exceção) | Link de redefinição expirado | 1. Acessar a URL do link de redefinição já expirado. | URL expirada | Mensagem de link inválido com orientação para solicitar novo link |
| CT-UC03-04 | Senhas divergentes (Exceção) | Link de redefinição ativo | 1. Acessar URL de redefinição válida. 2. Digitar senhas diferentes nos dois campos. 3. Clicar "Confirmar". | senha: `Nova123!`; confirmação: `Diferente456!` | Envio bloqueado; mensagem indicando inconsistência entre os campos |

---

### Grupo 2: Coleta de Feedback

#### [UC-04] Envio de Feedback via QR Code → [uc-04-envio-feedback-qrcode.md](../casos-de-uso/uc-04-envio-feedback-qrcode.md)

| ID | Título | Pré-condições | Passos de Execução | Dados de Teste | Resultado Esperado |
|---|---|---|---|---|---|
| CT-UC04-01 | Caminho feliz | Empresa ativa; QR Code ativo; perguntas dinâmicas configuradas; dispositivo sem envio anterior no dia | 1. Acessar URL do formulário com identifier válido. 2. Selecionar nota 5. 3. Preencher comentário. 4. Responder todas as perguntas dinâmicas. 5. Clicar em "Enviar". | identifier: `empresa-teste`; nota: 5; comentário: "Ótimo atendimento" | Tela de agradecimento exibida; feedback registrado no banco |
| CT-UC04-02 | Empresa inválida (Exceção) | Nenhuma empresa com o identifier informado | 1. Acessar URL com identifier inexistente. | identifier: `empresa-inexistente-xyz` | Tela de erro fatal exibida; formulário não renderizado |
| CT-UC04-03 | Dispositivo duplicado (Exceção) | Dispositivo já enviou feedback para o mesmo ponto de coleta hoje | 1. Acessar URL do formulário. 2. Preencher e submeter o formulário normalmente. | Mesmo fingerprint do envio anterior | Sistema aceita o envio mas exibe tela de "feedback já registrado hoje" |
| CT-UC04-04 | Nota não selecionada (Exceção) | Empresa e QR Code ativos | 1. Acessar URL válida. 2. Preencher comentário. 3. Responder perguntas. 4. Clicar "Enviar" sem selecionar nota. | Sem nota selecionada | Envio bloqueado; mensagem "Por favor, selecione uma avaliação" exibida |
| CT-UC04-05 | Comentário vazio (Exceção) | Empresa e QR Code ativos | 1. Acessar URL válida. 2. Selecionar nota. 3. Responder perguntas. 4. Clicar "Enviar" sem preencher comentário. | Comentário: `""` | Envio bloqueado; mensagem "Por favor, escreva seu feedback" exibida |
| CT-UC04-06 | Perguntas não respondidas (Exceção) | Empresa com perguntas dinâmicas; QR Code ativo | 1. Acessar URL válida. 2. Selecionar nota. 3. Preencher comentário. 4. Deixar ao menos uma pergunta sem resposta. 5. Clicar "Enviar". | 1 pergunta sem resposta | Envio bloqueado; mensagem solicitando que todas as perguntas sejam respondidas |

#### [UC-05] Geração e Compartilhamento de QR Code → [uc-05-geracao-qrcode.md](../casos-de-uso/uc-05-geracao-qrcode.md)

| ID | Título | Pré-condições | Passos de Execução | Dados de Teste | Resultado Esperado |
|---|---|---|---|---|---|
| CT-UC05-01 | Ativar/desativar (Caminho Feliz) | Gestor autenticado; página de QR Code carregada | 1. Clicar no botão de controle do QR Code. | — | Toast de confirmação exibido; estado visual atualizado imediatamente |
| CT-UC05-02 | Download (Caminho Feliz) | Gestor autenticado | 1. Clicar em "Download" na página de QR Code. | — | Download de arquivo `.png` disparado com o nome da empresa no título |
| CT-UC05-03 | Copiar link (Caminho Feliz) | Gestor autenticado | 1. Clicar em "Copiar link". | — | URL copiada para a área de transferência; indicador visual de cópia por 2 segundos |
| CT-UC05-04 | Compartilhar (Caminho Feliz) | Ambiente com `navigator.share` disponível | 1. Clicar em "Compartilhar". | — | API nativa de compartilhamento invocada com título, descrição e link corretos |
| CT-UC05-05 | Share API indisponível (Exceção) | Ambiente sem `navigator.share` | 1. Clicar em "Compartilhar". | — | Link copiado automaticamente para a área de transferência (sem mensagem de erro) |
| CT-UC05-06 | QR desativado — formulário bloqueado (Exceção) | QR Code da empresa no estado inativo | 1. Acessar o link do formulário público da empresa com QR Code desativado. | identifier: `empresa-teste` (QR inativo) | Tela de erro fatal no formulário público; envio bloqueado |

---

### Grupo 3: Configuração

#### [UC-06] Ativação de Tipos de Feedback → [uc-06-ativacao-tipos-feedback.md](../casos-de-uso/uc-06-ativacao-tipos-feedback.md)

| ID | Título | Pré-condições | Passos de Execução | Dados de Teste | Resultado Esperado |
|---|---|---|---|---|---|
| CT-UC06-01 | Ativar tipo (Caminho Feliz) | Gestor autenticado; tipo "Produtos" inativo | 1. Acessar tela de tipos de feedback. 2. Ativar o toggle "Produtos". 3. Clicar "Salvar Alterações". | — | Toast de sucesso; badge "Ativo" e link "Configurar catálogo de produtos" aparecem no card |
| CT-UC06-02 | Desativar tipo (Caminho Feliz) | Gestor autenticado; tipo "Produtos" ativo | 1. Acessar tela de tipos de feedback. 2. Desativar o toggle "Produtos". 3. Clicar "Salvar Alterações". | — | Toast de sucesso; badge e link de catálogo desaparecem do card |
| CT-UC06-03 | Toggle sem salvar (Comportamento) | Gestor autenticado | 1. Ativar toggle de um tipo. 2. NÃO clicar em "Salvar". | — | Aviso em âmbar exibido; badge "Ativo" e link de catálogo NÃO aparecem |
| CT-UC06-04 | Erro ao salvar (Exceção) | Gestor autenticado; rede instável | 1. Ativar toggle de um tipo. 2. Clicar "Salvar Alterações" com falha de rede simulada. | — | Toast de erro exibido; estado salvo dos tipos não alterado |

#### [UC-07] Configuração do Catálogo → [uc-07-configuracao-catalogo.md](../casos-de-uso/uc-07-configuracao-catalogo.md)

| ID | Título | Pré-condições | Passos de Execução | Dados de Teste | Resultado Esperado |
|---|---|---|---|---|---|
| CT-UC07-01 | Adicionar item (Caminho Feliz) | Gestor autenticado; tipo "Produtos" ativo | 1. Acessar catálogo de produtos. 2. Preencher nome do novo produto. 3. Clicar "Salvar". | nome: `Produto Teste A` | Toast de sucesso; item aparece na lista com status ativo |
| CT-UC07-02 | Editar item (Caminho Feliz) | Item existente no catálogo | 1. Acessar catálogo. 2. Editar nome de um item existente. 3. Clicar "Salvar". | nome editado: `Produto Atualizado` | Toast de sucesso; nome atualizado na lista |
| CT-UC07-03 | Salvar perguntas (Caminho Feliz) | Item existente no catálogo | 1. Expandir card do item. 2. Configurar pergunta dinâmica válida. 3. Clicar "Salvar perguntas". | texto: `Como você avaliaria a qualidade?` (31 chars) | Toast de sucesso para aquele item; pergunta salva |
| CT-UC07-04 | Toggle QR Code por item (Caminho Feliz) | Item existente no catálogo | 1. Expandir card do item. 2. Clicar no toggle de QR Code do item. | — | Toast de sucesso; estado do toggle atualizado sem necessidade de salvar o catálogo |
| CT-UC07-05 | Pergunta inválida — curta (Exceção) | Item existente no catálogo | 1. Expandir card do item. 2. Inserir pergunta com menos de 20 caracteres. 3. Clicar "Salvar perguntas". | texto: `Curta` (5 chars) | Envio bloqueado; campo destacado com erro de comprimento mínimo |
| CT-UC07-06 | Pergunta inválida — longa (Exceção) | Item existente no catálogo | 1. Expandir card do item. 2. Inserir pergunta com mais de 150 caracteres. 3. Clicar "Salvar perguntas". | texto: 151 caracteres | Envio bloqueado; campo destacado com erro de comprimento máximo |
| CT-UC07-07 | Item inativo — formulário bloqueado (Exceção) | Item existente no catálogo | 1. Desativar um item (status inativo). 2. Acessar a URL do formulário público daquele item. | — | Tela de erro fatal no formulário público; envio bloqueado |
| CT-UC07-08 | QR Code de item desativado (Exceção) | Item ativo com toggle de QR Code inativo | 1. Desativar o toggle de QR Code de um item. 2. Acessar a URL do formulário público daquele item. | — | Tela de erro no formulário público; envio bloqueado |

#### [UC-08] Configuração de Dados de Coleta (Contexto IA) → [uc-08-configuracao-coleta-ia.md](../casos-de-uso/uc-08-configuracao-coleta-ia.md)

| ID | Título | Pré-condições | Passos de Execução | Dados de Teste | Resultado Esperado |
|---|---|---|---|---|---|
| CT-UC08-01 | Caminho feliz | Gestor autenticado | 1. Acessar tela de dados de coleta. 2. Preencher os três campos. 3. Clicar "Salvar Alterações". | objetivo: `Aumentar retenção`; objetivo analítico: `Identificar pontos de dor`; resumo: `Restaurante de culinária japonesa` | Toast de sucesso; dados salvos |
| CT-UC08-02 | Campos em branco (Caminho Alternativo) | Gestor autenticado | 1. Acessar tela de dados de coleta. 2. Limpar todos os campos. 3. Clicar "Salvar Alterações". | Todos os campos: `""` | Toast de sucesso — campos em branco são permitidos |
| CT-UC08-03 | Atualização parcial (Caminho Alternativo) | Gestor com dados já preenchidos | 1. Acessar tela. 2. Editar apenas o campo "Resumo do Negócio". 3. Clicar "Salvar Alterações". | Resumo atualizado; demais campos mantidos | Toast de sucesso; apenas o resumo alterado — os demais campos permanecem inalterados |
| CT-UC08-04 | Erro ao salvar (Exceção) | Gestor autenticado; rede instável | 1. Preencher os campos. 2. Clicar "Salvar Alterações" com falha de rede simulada. | — | Toast de erro; dados do formulário permanecem para nova tentativa |

#### [UC-12] Gestão de Perfil → [uc-12-gestao-perfil.md](../casos-de-uso/uc-12-gestao-perfil.md)

| ID | Título | Pré-condições | Passos de Execução | Dados de Teste | Resultado Esperado |
|---|---|---|---|---|---|
| CT-UC12-01 | Atualizar nome (Caminho Feliz) | Gestor autenticado | 1. Acessar tela de perfil. 2. Editar o campo de nome. 3. Salvar. | nome: `Gestor Atualizado` | Novo nome aparece no perfil após salvar |
| CT-UC12-02 | Atualizar e-mail (Caminho Feliz) | Gestor autenticado | 1. Acessar tela de perfil. 2. Informar novo e-mail válido. 3. Confirmar. | e-mail: `novo@email.com` | Mensagem de sucesso informando que confirmação foi enviada para os dois endereços |
| CT-UC12-03 | Atualizar telefone (Caminho Feliz) | Gestor autenticado | 1. Acessar tela de perfil. 2. Clicar no campo de telefone (modo edição). 3. Informar novo número e clicar "Enviar SMS". 4. Inserir código de 6 dígitos recebido. 5. Clicar "Confirmar". | número: `+55 11 99999-0001`; código: válido | Telefone atualizado na conta; tela retorna ao modo de visualização |
| CT-UC12-04 | Cancelar atualização de telefone (Caminho Alternativo) | Gestor no modo de edição ou verificação de telefone | 1. Clicar em "Cancelar" durante qualquer etapa da atualização de telefone. | — | Tela retorna ao modo de visualização sem alterar o número atual |
| CT-UC12-05 | Nome vazio (Exceção) | Gestor autenticado | 1. Acessar tela de perfil. 2. Apagar o conteúdo do campo de nome. 3. Tentar salvar. | nome: `""` | Envio bloqueado; campo de nome destacado como obrigatório |
| CT-UC12-06 | Telefone inválido (Exceção) | Gestor no modo edição de telefone | 1. Informar número fora do padrão `+55 DDD NÚMERO`. 2. Clicar "Enviar SMS". | número: `12345` | Formulário bloqueado antes de chamar a API; mensagem de formato inválido |
| CT-UC12-07 | Código de verificação inválido (Exceção) | Gestor no modo verificação de telefone | 1. Inserir código incorreto. 2. Clicar "Confirmar". | código: `000000` (errado) | Toast de erro "Código inválido"; permanece no modo de verificação |

---

### Grupo 4: Análise e Insights

#### [UC-09] Visualização do Dashboard → [uc-09-dashboard.md](../casos-de-uso/uc-09-dashboard.md)

| ID | Título | Pré-condições | Passos de Execução | Dados de Teste | Resultado Esperado |
|---|---|---|---|---|---|
| CT-UC09-01 | Caminho feliz | Gestor autenticado; empresa com feedbacks coletados | 1. Acessar o dashboard. | — | 4 cards de métricas, gráfico de distribuição, últimos 5 feedbacks e Estratégia de Coleta visíveis e populados |
| CT-UC09-02 | Toast de login (Caminho Alternativo) | Gestor que acabou de fazer login | 1. Fazer login. 2. Observar o dashboard após redirecionamento. | URL: `?login=success` | Toast de boas-vindas exibido; parâmetro `?login=success` removido da URL |
| CT-UC09-03 | Sem feedbacks (Caminho Alternativo) | Empresa sem nenhum feedback coletado | 1. Acessar o dashboard. | — | Cards com zeros; gráficos em estado vazio; lista com mensagem "Nenhum feedback foi recebido" |
| CT-UC09-04 | Erro de carregamento (Exceção) | API de estatísticas indisponível | 1. Acessar o dashboard com API de estatísticas simulando falha. | — | Mensagem de erro inline no topo; página permanece acessível sem redirecionamento |
| CT-UC09-05 | Sessão expirada (Exceção) | Sessão do gestor inválida | 1. Tentar acessar o dashboard com sessão inválida. | — | Redirecionamento automático para `/login` |

#### [UC-10] Listagem e Filtragem de Feedbacks → [uc-10-listagem-feedbacks.md](../casos-de-uso/uc-10-listagem-feedbacks.md)

| ID | Título | Pré-condições | Passos de Execução | Dados de Teste | Resultado Esperado |
|---|---|---|---|---|---|
| CT-UC10-01 | Caminho feliz | Gestor autenticado; empresa com feedbacks | 1. Acessar listagem de feedbacks. 2. Clicar em um feedback. | — | Lista paginada exibida; modal de detalhes com cabeçalho, mensagem completa, ponto de coleta, perguntas, dispositivo e cliente |
| CT-UC10-02 | Filtro por nota (Caminho Feliz) | Empresa com feedbacks de notas variadas | 1. Acessar listagem. 2. Selecionar nota 5 no filtro de avaliação. | nota: 5 | Apenas feedbacks com nota 5 exibidos |
| CT-UC10-03 | Filtro por categoria (Caminho Feliz) | Empresa com feedbacks de múltiplas categorias | 1. Acessar listagem. 2. Selecionar "Produto" no filtro de categoria. | categoria: `PRODUCT` | Apenas feedbacks de pontos de coleta do tipo Produto exibidos |
| CT-UC10-04 | Busca textual (Caminho Feliz) | Empresa com feedbacks | 1. Acessar listagem. 2. Digitar um termo no campo de busca e aguardar ~450ms. | busca: `atendimento` | Feedbacks que contêm o termo na mensagem exibidos após o debounce |
| CT-UC10-05 | Filtro por item (Caminho Feliz) | Empresa com feedbacks de múltiplos itens | 1. Acessar listagem. 2. Digitar nome de um item no filtro de item e aguardar ~450ms. | item: `Produto A` | Feedbacks daquele item exibidos após o debounce |
| CT-UC10-06 | Paginação (Caminho Feliz) | Empresa com mais de 10 feedbacks | 1. Acessar listagem (padrão 10 itens/página). 2. Navegar para a segunda página. | — | Segunda página carregada; filtros ativos mantidos |
| CT-UC10-07 | Filtro sem resultado (Exceção) | Empresa com feedbacks | 1. Aplicar filtro que não corresponde a nenhum feedback. | nota: 1 (sem feedbacks com essa nota) | Empty state com mensagem de "ajuste os filtros" exibido |
| CT-UC10-08 | Sem feedbacks (Exceção) | Empresa sem nenhum feedback coletado | 1. Acessar listagem. | — | Empty state com mensagem de "nenhum feedback recebido" exibido |

#### [UC-11] Disparo e Visualização de Insights IA → [uc-11-insights-ia.md](../casos-de-uso/uc-11-insights-ia.md)

| ID | Título | Pré-condições | Passos de Execução | Dados de Teste | Resultado Esperado |
|---|---|---|---|---|---|
| CT-UC11-01 | Analisar feedbacks (Caminho Feliz) | Contexto de IA preenchido (os 3 campos); mínimo de 10 feedbacks | 1. Acessar painel de insights. 2. Clicar em "Analisar feedbacks". | — | Processamento concluído; clima emocional (Mood) atualizado na tela |
| CT-UC11-02 | Gerar insights (Caminho Feliz) | Feedbacks já analisados; contexto preenchido | 1. Clicar em "Gerar insights". | — | Relatório atualizado com resumo estratégico e lista de recomendações da IA |
| CT-UC11-03 | Escopo por produto (Caminho Feliz) | Catálogo com item de produto ativo; contexto preenchido; feedbacks suficientes | 1. Selecionar escopo "Produto". 2. Escolher item de catálogo. 3. Clicar "Analisar feedbacks" e depois "Gerar insights". | escopo: PRODUCT; item: `Produto A` | Relatório reflete dados apenas daquele item específico |
| CT-UC11-04 | Navegação entre abas (Caminho Feliz) | Relatório gerado | 1. Acessar painel de insights. 2. Navegar para aba "Análise Emocional". 3. Navegar para aba "Estatísticas". | — | Dados de análise emocional e estatísticas exibidos em cada aba correspondente |
| CT-UC11-05 | Contexto incompleto (Exceção) | Algum dos 3 campos de contexto em branco | 1. Acessar painel de insights sem contexto completo. | Um ou mais campos de UC-08 em branco | Botões "Analisar feedbacks" e "Gerar insights" desabilitados; mensagem com link para tela de configuração |
| CT-UC11-06 | Item não selecionado (Exceção) | Gestor autenticado | 1. Selecionar escopo "Produto". 2. NÃO escolher item de catálogo. | escopo: PRODUCT; item: não selecionado | Botões permanecem desabilitados |
| CT-UC11-07 | Volume insuficiente (Exceção) | Contexto preenchido; menos de 10 feedbacks | 1. Acessar painel de insights. 2. Clicar "Analisar feedbacks". | feedbacks disponíveis: < 10 | Mensagem "É necessário no mínimo 10 feedbacks" retornada; ação bloqueada |

---

### Relatório de Execução / Artefatos Complementares

**Massa de Dados:**

- A empresa de teste deve ser criada manualmente no ambiente de homologação antes da primeira execução, com conta ativa, gestor autenticado e todos os tipos de feedback ativados.
- O fingerprint de dispositivo deve ser resetado (via script de limpeza no banco) antes de cada execução dos testes de UC-04 para evitar bloqueio por anti-spam.
- Os feedbacks necessários para UC-11 (mínimo 10) devem ser inseridos diretamente no banco de homologação caso o volume ainda não tenha sido atingido via envio manual.
- Para os testes de UC-07 e UC-08, ao menos um item de catálogo deve estar cadastrado e ativo no ambiente de teste.

**Critérios de Sucesso:**

O conjunto de testes é considerado aprovado quando todos os 69 casos de teste desta fase executam com o resultado esperado, sem nenhum comportamento divergente nos fluxos de Caminho Feliz, e com todos os bloqueios de exceção ocorrendo exatamente na etapa documentada.
