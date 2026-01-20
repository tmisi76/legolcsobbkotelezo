-- Create storage bucket for insurance documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('insurance-documents', 'insurance-documents', false);

-- RLS policies for the bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'insurance-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'insurance-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'insurance-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'insurance-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add document_url column to cars table
ALTER TABLE public.cars ADD COLUMN document_url TEXT;