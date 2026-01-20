-- Admin policy a dokumentumok olvasásához
CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'insurance-documents' 
  AND public.has_role(auth.uid(), 'admin')
);