# Descrições dos objetos SQL

## Tabelas
- `auth.users`: tabela base de usuários de autenticação (credenciais, metadados e estado de conta).
- `public.enterprise`: cadastro da empresa vinculada ao usuário autenticado (`auth_user_id`).
- `public.collecting_data_enterprise`: dados estratégicos da empresa para contexto de análise (objetivo, resumo, listas de produtos/serviços e flags de uso de produtos, serviços e áreas/departamentos).
- `public.collection_points`: pontos de coleta de feedback (ex.: QR Code), com status e identificação.
- `public.customer`: cadastro de clientes finais associados à empresa.
- `public.tracked_devices`: rastreio de dispositivos por fingerprint, bloqueio e contagem de feedbacks.
- `public.feedback`: feedback bruto enviado pelo cliente (mensagem, nota, vínculo com ponto/dispositivo/empresa).
- `public.feedback_analysis`: resultado analítico do feedback (sentimento, categorias e palavras-chave).
- `public.feedback_insights_report`: relatório consolidado de insights e recomendações por empresa.

## Funções (public)
- `can_device_send_feedback`: valida se um dispositivo ainda pode enviar feedback no limite diário.
- `clean_user_metadata_before_change`: higieniza metadados do usuário antes de update e normaliza telefone.
- `create_enterprise_on_signup`: cria empresa no signup, valida documento/telefone e limpa metadados sensíveis.
- `document_exists`: consulta rápida para verificar se documento de empresa já existe.
- `enterprise_public_documents_fn`: lista documentos públicos distintos das empresas.
- `enterprise_public_ids_fn`: lista IDs/documentos/tipo de conta para uso público controlado.
- `generate_device_fingerprint`: gera fingerprint diário do dispositivo com user-agent + IP.
- `jwt_custom_claims`: monta claims extras do JWT (role e `enterprise_id`).
- `phone_exists`: consulta rápida para verificar se telefone já existe em `auth.users`.
- `register_device_feedback`: upsert de dispositivo rastreado e incremento de contagem de feedback.
- `update_updated_at_column`: trigger function genérica para manter campo `updated_at`.

## Triggers
- `auth.users.on_auth_user_created`: ao criar usuário, dispara criação/configuração inicial da empresa.
- `auth.users.on_auth_user_metadata_before_update`: antes de atualizar usuário, limpa metadados.
- `public.*.set_updated_at` (collecting_data_enterprise, collection_points, customer, enterprise, feedback, feedback_analysis, tracked_devices): atualiza `updated_at` automaticamente em updates.
- `storage.buckets.enforce_bucket_name_length_trigger` (INSERT/UPDATE): valida tamanho de nome de bucket no módulo de storage.
- `storage.buckets.protect_buckets_delete`: bloqueia deleções indevidas em buckets protegidos.
- `storage.objects.protect_objects_delete`: bloqueia deleções indevidas em objetos protegidos.
- `storage.objects.update_objects_updated_at`: mantém `updated_at` de objetos de storage.

## Permissões (Policies / RLS)
### public.collecting_data_enterprise
- `Auth gerencia dados de coleta`: só usuários autenticados da própria empresa podem ler/escrever dados de coleta.

### public.collection_points
- `Anon pode ler pontos QR_CODE ativos`: acesso público somente para leitura de pontos QR ativos.
- `Usuários autenticados podem gerenciar pontos de coleta`: gestão completa apenas pela empresa dona.

### public.customer
- `Usuários autenticados podem gerenciar clientes`: gestão completa de clientes restrita à empresa dona.

### public.enterprise
- `Usuários autenticados podem criar sua empresa`: permite inserir empresa apenas com `auth_user_id` igual ao usuário logado.
- `Usuários autenticados veem apenas sua empresa`: leitura limitada à própria empresa.
- `Usuários podem atualizar sua própria empresa`: update limitado ao próprio registro de empresa.

### public.feedback
- `Anon pode inserir feedback via QR_CODE com checks`: permite feedback anônimo só com validações de ponto ativo e dispositivo válido/não bloqueado.
- `Usuários autenticados podem gerenciar feedbacks`: gestão completa de feedbacks restrita à empresa dona.

### public.feedback_analysis
- `Empresas gerenciam apenas suas próprias análises`: acesso às análises somente quando o feedback pertence à empresa logada.

### public.feedback_insights_report
- `feedback_insights_report_insert`: inserção de relatório apenas para a própria empresa.
- `feedback_insights_report_select`: leitura de relatório apenas da própria empresa.
- `feedback_insights_report_update`: atualização de relatório apenas da própria empresa.

### public.tracked_devices
- `Anon pode atualizar contagem do proprio device`: anônimo pode atualizar contagem apenas em device válido e não bloqueado.
- `Permitir criação anônima de dispositivo`: permite criar registro de device anônimo com dados mínimos obrigatórios.
- `Permitir verificação anônima de dispositivo`: permite consulta anônima de existência/estado do device.
- `Usuários autenticados podem gerenciar dispositivos`: gestão completa de dispositivos restrita à empresa dona.
