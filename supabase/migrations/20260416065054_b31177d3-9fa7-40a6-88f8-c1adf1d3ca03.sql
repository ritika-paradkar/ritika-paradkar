-- Create enum types
CREATE TYPE public.verification_status AS ENUM ('real', 'suspicious', 'fake');
CREATE TYPE public.risk_level AS ENUM ('high', 'medium', 'low');

-- Create users table
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert" ON public.users FOR INSERT WITH CHECK (true);

-- Create clauses table
CREATE TABLE public.clauses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clause_name TEXT NOT NULL,
  description TEXT NOT NULL,
  risk_level risk_level NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.clauses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clauses are viewable by everyone" ON public.clauses FOR SELECT USING (true);
CREATE POLICY "Clauses can be inserted" ON public.clauses FOR INSERT WITH CHECK (true);

-- Create cases table
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  outcome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cases are viewable by everyone" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Cases can be inserted" ON public.cases FOR INSERT WITH CHECK (true);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_url TEXT,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  file_size TEXT,
  status verification_status NOT NULL DEFAULT 'suspicious',
  risk_level risk_level NOT NULL DEFAULT 'medium',
  risk_score INTEGER NOT NULL DEFAULT 50,
  confidence INTEGER NOT NULL DEFAULT 50,
  case_type TEXT,
  priority risk_level NOT NULL DEFAULT 'medium',
  clauses JSONB DEFAULT '[]'::jsonb,
  risks JSONB DEFAULT '[]'::jsonb,
  timeline JSONB DEFAULT '[]'::jsonb,
  alerts JSONB DEFAULT '[]'::jsonb,
  recommendation JSONB DEFAULT '{}'::jsonb,
  precedents JSONB DEFAULT '[]'::jsonb,
  similar_case_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Documents are viewable by everyone" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Documents can be inserted" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Documents can be updated" ON public.documents FOR UPDATE USING (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);
CREATE POLICY "Document files are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Anyone can upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();