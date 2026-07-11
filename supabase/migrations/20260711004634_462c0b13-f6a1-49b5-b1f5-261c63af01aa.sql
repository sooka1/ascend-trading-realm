
CREATE OR REPLACE FUNCTION public.enforce_documents_storage_path_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- storage_path must start with the owner's user_id folder, e.g. "<uuid>/..."
  IF NEW.storage_path IS NULL OR position('/' in NEW.storage_path) = 0 THEN
    RAISE EXCEPTION 'documents.storage_path must be scoped under a user folder ("<user_id>/...")'
      USING ERRCODE = 'check_violation';
  END IF;
  IF split_part(NEW.storage_path, '/', 1) <> NEW.user_id::text THEN
    RAISE EXCEPTION 'documents.storage_path (%) does not match user_id (%)',
      NEW.storage_path, NEW.user_id
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_documents_storage_path_owner_ins ON public.documents;
CREATE TRIGGER enforce_documents_storage_path_owner_ins
BEFORE INSERT ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.enforce_documents_storage_path_owner();

DROP TRIGGER IF EXISTS enforce_documents_storage_path_owner_upd ON public.documents;
CREATE TRIGGER enforce_documents_storage_path_owner_upd
BEFORE UPDATE OF storage_path, user_id ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.enforce_documents_storage_path_owner();
