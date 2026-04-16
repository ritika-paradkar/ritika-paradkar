
-- Add new columns to documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS deadlines jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS summary text;

-- Create document_versions table
CREATE TABLE public.document_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  file_name text NOT NULL,
  file_url text,
  changes_summary text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document versions are viewable by everyone"
ON public.document_versions FOR SELECT USING (true);

CREATE POLICY "Document versions can be inserted"
ON public.document_versions FOR INSERT WITH CHECK (true);
