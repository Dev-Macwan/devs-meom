-- Create profile_photos storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile_photos', 'profile_photos', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for profile_photos bucket
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profile_photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own profile photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'profile_photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'profile_photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'profile_photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);