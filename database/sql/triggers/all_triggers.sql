-- Descrição: Triggers consolidados do schema atual.
-- Uso: Conecta eventos de tabela às funções automáticas (auditoria, atualização, validação).

DROP TRIGGER IF EXISTS "on_auth_user_created" ON "auth"."users";
CREATE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users"
  FOR EACH ROW
  EXECUTE FUNCTION create_enterprise_on_signup();

DROP TRIGGER IF EXISTS "on_auth_user_metadata_before_update" ON "auth"."users";
CREATE TRIGGER "on_auth_user_metadata_before_update" BEFORE UPDATE ON "auth"."users"
  FOR EACH ROW
  EXECUTE FUNCTION clean_user_metadata_before_change();

DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."collecting_data_enterprise";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."collecting_data_enterprise"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."catalog_items";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."catalog_items"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."collection_points";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."collection_points"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."customer";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."customer"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."enterprise";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."enterprise"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."feedback";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."feedback"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "validate_questions_of_feedbacks_context" ON "public"."questions_of_feedbacks";
CREATE TRIGGER "validate_questions_of_feedbacks_context"
  BEFORE INSERT OR UPDATE ON "public"."questions_of_feedbacks"
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_questions_of_feedbacks_context();

DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."questions_of_feedbacks";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."questions_of_feedbacks"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."feedback_analysis";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."feedback_analysis"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."tracked_devices";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."tracked_devices"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS "enforce_bucket_name_length_trigger" ON "storage"."buckets";
CREATE TRIGGER "enforce_bucket_name_length_trigger" BEFORE UPDATE ON "storage"."buckets"
  FOR EACH ROW
  EXECUTE FUNCTION storage.enforce_bucket_name_length();

DROP TRIGGER IF EXISTS "enforce_bucket_name_length_trigger" ON "storage"."buckets";
CREATE TRIGGER "enforce_bucket_name_length_trigger" BEFORE INSERT ON "storage"."buckets"
  FOR EACH ROW
  EXECUTE FUNCTION storage.enforce_bucket_name_length();

DROP TRIGGER IF EXISTS "protect_buckets_delete" ON "storage"."buckets";
CREATE TRIGGER "protect_buckets_delete" BEFORE DELETE ON "storage"."buckets"
  FOR EACH STATEMENT
  EXECUTE FUNCTION storage.protect_delete();

DROP TRIGGER IF EXISTS "protect_objects_delete" ON "storage"."objects";
CREATE TRIGGER "protect_objects_delete" BEFORE DELETE ON "storage"."objects"
  FOR EACH STATEMENT
  EXECUTE FUNCTION storage.protect_delete();

DROP TRIGGER IF EXISTS "update_objects_updated_at" ON "storage"."objects";
CREATE TRIGGER "update_objects_updated_at" BEFORE UPDATE ON "storage"."objects"
  FOR EACH ROW
  EXECUTE FUNCTION storage.update_updated_at_column();


