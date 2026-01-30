-- Frissítsük a profiles táblát az auth.users email címeivel
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id
  AND p.email IS NULL;