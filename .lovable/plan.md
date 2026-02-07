

# Terv: Jelszó-visszaállító email küldés javítása

## Probléma azonosítva

A jelszó-visszaállító email nem érkezik meg, mert a Supabase beépített SMTP rendszere korlátozott Lovable Cloud környezetben. A reminder emailek már Resend-et használnak, de a jelszó-visszaállításhoz még nincs ilyen megoldás.

---

## Megoldás: Egyedi Edge Function a jelszó-visszaállításhoz

Létrehozunk egy új Edge Function-t (`send-password-reset`), ami a Resend API-t használja a jelszó-visszaállító email küldésére.

### Működés

1. A felhasználó megadja az email címét
2. A frontend meghívja az új Edge Function-t
3. Az Edge Function:
   - Létrehoz egy Supabase recovery tokent (`generateLink`)
   - Elküldi a Resend-en keresztül a formázott emailt
   - A link a published URL-re mutat (`legolcsobbkotelezo.lovable.app`)

---

## Technikai megvalósítás

### 1. Új Edge Function: `send-password-reset`

**Fájl:** `supabase/functions/send-password-reset/index.ts`

- Fogadja az email címet a request body-ban
- Ellenőrzi, hogy létezik-e ilyen felhasználó
- Generál egy recovery linket a Supabase Admin API-val
- Elküldi az emailt Resend-en keresztül
- Szép, magyar nyelvű HTML email template

### 2. Frontend módosítás: `ForgotPassword.tsx`

- A `supabase.auth.resetPasswordForEmail` helyett az új Edge Function-t hívja
- Kezeli a válaszokat és hibákat

### 3. Config frissítés: `supabase/config.toml`

- JWT verifikáció kikapcsolása az új function-hoz (publikus endpoint)

---

## Módosítandó fájlok

| Fájl | Változtatás |
|------|-------------|
| `supabase/functions/send-password-reset/index.ts` | Új Edge Function létrehozása |
| `supabase/config.toml` | Új function regisztrálása |
| `src/pages/ForgotPassword.tsx` | Edge Function hívás a Supabase helyett |
| `src/contexts/AuthContext.tsx` | `resetPassword` függvény frissítése (opcionális) |

---

## Biztonsági szempontok

- Rate limiting: ne lehessen spammelni az emaileket
- Az email cím létezésének nem fedése fel (mindig "Ha létezik ilyen fiók..." üzenet)
- HTTPS only redirect URL
- A recovery token lejárati ideje (1 óra)

---

## Email sablon

Magyar nyelvű, LegolcsóbbKötelező arculatához illő design:
- Logo és fejléc
- Üdvözlés
- Visszaállító link gomb
- Lejárati információ
- Lábléc

---

## Eredmény

A jelszó-visszaállító emailek megbízhatóan kiküldésre kerülnek a Resend-en keresztül, ugyanúgy mint a reminder emailek.

