-- Create storage bucket for documents (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents_vault', 'documents_vault', false);

-- Create documents metadata table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  user_note TEXT,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for documents table
CREATE POLICY "Users can view own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

-- Storage policies for documents_vault bucket
CREATE POLICY "Users can view own document files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents_vault' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own document files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents_vault' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own document files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents_vault' AND auth.uid()::text = (storage.foldername(name))[1]);