
-- === public.documents: add user_id, lock policies ===
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Documents are viewable by everyone" ON public.documents;
DROP POLICY IF EXISTS "Documents can be inserted" ON public.documents;
DROP POLICY IF EXISTS "Documents can be updated" ON public.documents;

CREATE POLICY "Users view own documents" ON public.documents
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own documents" ON public.documents
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own documents" ON public.documents
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own documents" ON public.documents
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

REVOKE ALL ON public.documents FROM anon;

-- === public.document_versions: add user_id via parent doc, scope policies ===
ALTER TABLE public.document_versions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Document versions are viewable by everyone" ON public.document_versions;
DROP POLICY IF EXISTS "Document versions can be inserted" ON public.document_versions;

CREATE POLICY "Users view own doc versions" ON public.document_versions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own doc versions" ON public.document_versions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

REVOKE ALL ON public.document_versions FROM anon;

-- === public.cases: reference data, read-only for authenticated ===
DROP POLICY IF EXISTS "Cases are viewable by everyone" ON public.cases;
DROP POLICY IF EXISTS "Cases can be inserted" ON public.cases;

CREATE POLICY "Authenticated users view cases" ON public.cases
  FOR SELECT TO authenticated USING (true);

REVOKE ALL ON public.cases FROM anon;

-- === public.clauses: reference data, read-only for authenticated ===
DROP POLICY IF EXISTS "Clauses are viewable by everyone" ON public.clauses;
DROP POLICY IF EXISTS "Clauses can be inserted" ON public.clauses;

CREATE POLICY "Authenticated users view clauses" ON public.clauses
  FOR SELECT TO authenticated USING (true);

REVOKE ALL ON public.clauses FROM anon;

-- === public.users: users can only see and create their own row ===
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can insert" ON public.users;

CREATE POLICY "Users view own row" ON public.users
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own row" ON public.users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

REVOKE ALL ON public.users FROM anon;

-- === storage.objects policies for 'documents' bucket (owner-scoped, path prefix = user id) ===
DROP POLICY IF EXISTS "Document files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload documents" ON storage.objects;

CREATE POLICY "Users read own document files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own document files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own document files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own document files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
