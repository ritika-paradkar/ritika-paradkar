
-- Tighten document_versions INSERT: user must own the referenced document
DROP POLICY IF EXISTS "Users insert own doc versions" ON public.document_versions;
CREATE POLICY "Users insert own doc versions" ON public.document_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_versions.document_id
        AND d.user_id = auth.uid()
    )
  );

-- Force user_id = auth.uid() on insert; block owner changes on update
CREATE OR REPLACE FUNCTION public.enforce_owner_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Not authenticated';
    END IF;
    NEW.user_id := auth.uid();
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'user_id is immutable';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS documents_enforce_owner ON public.documents;
CREATE TRIGGER documents_enforce_owner
  BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.enforce_owner_user_id();

DROP TRIGGER IF EXISTS document_versions_enforce_owner ON public.document_versions;
CREATE TRIGGER document_versions_enforce_owner
  BEFORE INSERT OR UPDATE ON public.document_versions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_owner_user_id();
