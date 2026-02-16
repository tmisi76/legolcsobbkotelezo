
-- 1. Create email_templates table
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text UNIQUE NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email templates"
  ON public.email_templates FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert email templates"
  ON public.email_templates FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update email templates"
  ON public.email_templates FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete email templates"
  ON public.email_templates FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Extend reminder_logs table
ALTER TABLE public.reminder_logs
  ADD COLUMN user_email text,
  ADD COLUMN user_name text,
  ADD COLUMN car_nickname text,
  ADD COLUMN license_plate text,
  ADD COLUMN link_clicked boolean NOT NULL DEFAULT false,
  ADD COLUMN callback_requested boolean NOT NULL DEFAULT false,
  ADD COLUMN offer_requested boolean NOT NULL DEFAULT false;

-- 3. Add admin SELECT policy for reminder_logs
CREATE POLICY "Admins can view all reminder logs"
  ON public.reminder_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- 4. Add service role UPDATE policy for reminder_logs (for tracking functions)
CREATE POLICY "Service role can update reminder logs"
  ON public.reminder_logs FOR UPDATE
  USING (true);
