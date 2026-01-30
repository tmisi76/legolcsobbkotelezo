-- Új email oszlop a profiles táblában
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Trigger frissítése: az email cím automatikusan kerüljön kitöltésre regisztrációnál
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      NEW.email
    );
    
    -- Increment user count in app_stats
    UPDATE public.app_stats SET total_users = total_users + 1 WHERE id = 1;
    
    RETURN NEW;
END;
$$;