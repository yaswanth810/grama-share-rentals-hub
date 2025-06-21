
-- Create a storage bucket for listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to listing images
CREATE POLICY "Allow public read access to listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

-- Allow users to update their own listing images
CREATE POLICY "Allow users to update their own listing images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'listing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own listing images
CREATE POLICY "Allow users to delete their own listing images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
