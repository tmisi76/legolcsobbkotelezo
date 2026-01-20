-- Add processing_status column to cars table for admin workflow
ALTER TABLE public.cars
ADD COLUMN processing_status TEXT DEFAULT 'pending';

-- Create RLS policy for admins to view all cars
CREATE POLICY "Admins can view all cars"
ON public.cars FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policy for admins to update all cars (for status changes)
CREATE POLICY "Admins can update all cars"
ON public.cars FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));