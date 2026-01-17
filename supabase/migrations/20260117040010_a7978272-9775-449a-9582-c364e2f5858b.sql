-- Create private_vault storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('private_vault', 'private_vault', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for private_vault bucket
CREATE POLICY "Users can upload to their own vault folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'private_vault' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own vault files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'private_vault' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own vault files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'private_vault' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own vault files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'private_vault' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);