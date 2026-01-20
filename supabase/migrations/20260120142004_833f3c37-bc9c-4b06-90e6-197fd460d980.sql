-- Add preference columns to cars table
ALTER TABLE public.cars
ADD COLUMN payment_method TEXT,
ADD COLUMN has_child_under_18 BOOLEAN DEFAULT false,
ADD COLUMN accepts_email_only BOOLEAN DEFAULT false,
ADD COLUMN payment_frequency TEXT;