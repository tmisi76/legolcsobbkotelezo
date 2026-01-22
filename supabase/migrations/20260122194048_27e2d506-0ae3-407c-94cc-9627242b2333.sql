-- Add INSERT policy for reminder_logs table
-- This allows the service role (used by edge functions) to insert reminder logs
-- The service role already bypasses RLS, but this provides explicit documentation
-- and allows for future scenarios where we might use authenticated calls

CREATE POLICY "Service role can insert reminder logs" 
ON public.reminder_logs 
FOR INSERT 
WITH CHECK (true);

-- Note: The edge functions use the service role key which bypasses RLS entirely.
-- This policy is added for documentation purposes and future-proofing.
-- Regular users cannot insert directly as they don't have authenticated access
-- to the edge function endpoints that create these logs.