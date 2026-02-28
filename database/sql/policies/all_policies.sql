-- Descrição: Políticas RLS consolidadas das tabelas de negócio.
-- Uso: Define quem pode inserir/ler/atualizar cada recurso no banco.

DROP POLICY IF EXISTS "Auth gerencia dados de coleta" ON "public"."collecting_data_enterprise";
CREATE POLICY "Auth gerencia dados de coleta" ON "public"."collecting_data_enterprise"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))))
  WITH CHECK ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar catálogo" ON "public"."catalog_items";
CREATE POLICY "Usuários autenticados podem gerenciar catálogo" ON "public"."catalog_items"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

DROP POLICY IF EXISTS "Anon pode ler catálogo ativo" ON "public"."catalog_items";
CREATE POLICY "Anon pode ler catálogo ativo" ON "public"."catalog_items"
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING ((status = 'ACTIVE'::text));

DROP POLICY IF EXISTS "Anon pode ler pontos QR_CODE ativos" ON "public"."collection_points";
CREATE POLICY "Anon pode ler pontos QR_CODE ativos" ON "public"."collection_points"
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (((type = 'QR_CODE'::text) AND (status = 'ACTIVE'::text) AND ((catalog_item_id IS NULL) OR (EXISTS ( SELECT 1 FROM catalog_items ci WHERE ((ci.id = collection_points.catalog_item_id) AND (ci.status = 'ACTIVE'::text)))))));

DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar pontos de coleta" ON "public"."collection_points";
CREATE POLICY "Usuários autenticados podem gerenciar pontos de coleta" ON "public"."collection_points"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar clientes" ON "public"."customer";
CREATE POLICY "Usuários autenticados podem gerenciar clientes" ON "public"."customer"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

DROP POLICY IF EXISTS "Usuários autenticados podem criar sua empresa" ON "public"."enterprise";
CREATE POLICY "Usuários autenticados podem criar sua empresa" ON "public"."enterprise"
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((auth.uid() = auth_user_id));

DROP POLICY IF EXISTS "Usuários autenticados veem apenas sua empresa" ON "public"."enterprise";
CREATE POLICY "Usuários autenticados veem apenas sua empresa" ON "public"."enterprise"
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = auth_user_id));

DROP POLICY IF EXISTS "Usuários podem atualizar sua própria empresa" ON "public"."enterprise";
CREATE POLICY "Usuários podem atualizar sua própria empresa" ON "public"."enterprise"
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((auth.uid() = auth_user_id))
  WITH CHECK ((auth.uid() = auth_user_id));

DROP POLICY IF EXISTS "Anon pode inserir feedback via QR_CODE com checks" ON "public"."feedback";
CREATE POLICY "Anon pode inserir feedback via QR_CODE com checks" ON "public"."feedback"
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (((EXISTS ( SELECT 1 FROM collection_points cp WHERE ((cp.id = feedback.collection_point_id) AND (cp.enterprise_id = feedback.enterprise_id) AND (cp.type = 'QR_CODE'::text) AND (cp.status = 'ACTIVE'::text)))) AND (enterprise_id IS NOT NULL) AND (tracked_device_id IS NOT NULL) AND (EXISTS ( SELECT 1 FROM tracked_devices td WHERE ((td.id = feedback.tracked_device_id) AND (td.enterprise_id = feedback.enterprise_id) AND (COALESCE(td.is_blocked, false) = false))))));

DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar feedbacks" ON "public"."feedback";
CREATE POLICY "Usuários autenticados podem gerenciar feedbacks" ON "public"."feedback"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

DROP POLICY IF EXISTS "Empresas gerenciam apenas suas próprias análises" ON "public"."feedback_analysis";
CREATE POLICY "Empresas gerenciam apenas suas próprias análises" ON "public"."feedback_analysis"
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((feedback_id IN ( SELECT f.id FROM feedback f WHERE (f.enterprise_id IN ( SELECT e.id FROM enterprise e WHERE (e.auth_user_id = auth.uid()))))));

DROP POLICY IF EXISTS "feedback_insights_report_insert" ON "public"."feedback_insights_report";
CREATE POLICY "feedback_insights_report_insert" ON "public"."feedback_insights_report"
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

DROP POLICY IF EXISTS "feedback_insights_report_select" ON "public"."feedback_insights_report";
CREATE POLICY "feedback_insights_report_select" ON "public"."feedback_insights_report"
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

DROP POLICY IF EXISTS "feedback_insights_report_update" ON "public"."feedback_insights_report";
CREATE POLICY "feedback_insights_report_update" ON "public"."feedback_insights_report"
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))))
  WITH CHECK ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

DROP POLICY IF EXISTS "Anon pode atualizar contagem do proprio device" ON "public"."tracked_devices";
CREATE POLICY "Anon pode atualizar contagem do proprio device" ON "public"."tracked_devices"
  AS PERMISSIVE
  FOR UPDATE
  TO anon
  USING (((enterprise_id IS NOT NULL) AND (device_fingerprint IS NOT NULL) AND (COALESCE(is_blocked, false) = false)))
  WITH CHECK (((enterprise_id IS NOT NULL) AND (device_fingerprint IS NOT NULL) AND (COALESCE(is_blocked, false) = false)));

DROP POLICY IF EXISTS "Permitir criação anônima de dispositivo" ON "public"."tracked_devices";
CREATE POLICY "Permitir criação anônima de dispositivo" ON "public"."tracked_devices"
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (((enterprise_id IS NOT NULL) AND (device_fingerprint IS NOT NULL)));

DROP POLICY IF EXISTS "Permitir verificação anônima de dispositivo" ON "public"."tracked_devices";
CREATE POLICY "Permitir verificação anônima de dispositivo" ON "public"."tracked_devices"
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (((device_fingerprint IS NOT NULL) AND (enterprise_id IS NOT NULL)));

DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar dispositivos" ON "public"."tracked_devices";
CREATE POLICY "Usuários autenticados podem gerenciar dispositivos" ON "public"."tracked_devices"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

