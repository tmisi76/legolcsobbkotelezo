-- Autó dokumentumok tábla
CREATE TABLE public.car_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.car_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for car_documents
CREATE POLICY "Users can view their own car documents"
  ON public.car_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cars WHERE cars.id = car_documents.car_id AND cars.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert documents for their own cars"
  ON public.car_documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cars WHERE cars.id = car_documents.car_id AND cars.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own car documents"
  ON public.car_documents FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cars WHERE cars.id = car_documents.car_id AND cars.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all car documents"
  ON public.car_documents FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Személyes dokumentumok típus enum
CREATE TYPE public.personal_document_type AS ENUM ('personal_id', 'address_card', 'drivers_license');

-- Személyes dokumentumok tábla
CREATE TABLE public.personal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_type public.personal_document_type NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  gdpr_consent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, document_type)
);

ALTER TABLE public.personal_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for personal_documents
CREATE POLICY "Users can view their own personal documents"
  ON public.personal_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personal documents"
  ON public.personal_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal documents"
  ON public.personal_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personal documents"
  ON public.personal_documents FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all personal documents"
  ON public.personal_documents FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Személyes dokumentumok storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('personal-documents', 'personal-documents', false);

-- Storage RLS for personal-documents bucket
CREATE POLICY "Users can upload their own personal docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'personal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own personal docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'personal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own personal docs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'personal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all personal docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'personal-documents' AND has_role(auth.uid(), 'admin'::app_role));