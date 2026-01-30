

# Terv: Email címek megjelenítése az admin felületen

## Probléma azonosítva

A `profiles` táblában az `email` mező **üres minden felhasználónál** (NULL). Az email címek az `auth.users` táblában vannak tárolva, de azt az RLS szabályok miatt nem lehet közvetlenül lekérdezni.

## Megoldás

Szinkronizálni kell az email címeket az `auth.users` táblából a `profiles` táblába:

1. **Egyszeri SQL migráció**: A meglévő felhasználók email címeit bemásoljuk
2. **Trigger frissítés**: A `handle_new_user` trigger már létezik, csak ellenőrizni kell, hogy az email-t is menti-e

---

## Technikai megvalósítás

### 1. lépés: Meglévő email címek szinkronizálása

```sql
-- Frissítsük a profiles táblát az auth.users email címeivel
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id
  AND p.email IS NULL;
```

### 2. lépés: Handle new user trigger ellenőrzése

A trigger-nek tartalmaznia kell az email mentését is:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  RETURN new;
END;
$$;
```

---

## Módosítások

| Típus | Leírás |
|-------|--------|
| SQL migráció | Email szinkronizálás auth.users → profiles |
| SQL migráció | handle_new_user trigger frissítése (ha szükséges) |

---

## Eredmény

A migráció után:
- Minden meglévő felhasználó `profiles.email` mezője ki lesz töltve
- Új felhasználók regisztrációjakor automatikusan mentésre kerül az email
- Az admin felületen megjelenik az email a Tulajdonos oszlopban

