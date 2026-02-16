
-- Fix: Drop overly permissive UPDATE policy and replace with service-role-only approach
-- The tracking edge functions use service role key which bypasses RLS anyway
DROP POLICY "Service role can update reminder logs" ON public.reminder_logs;
