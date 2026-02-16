

# Email emlekeztetoe rendszer komplex fejlesztese

Ez a terv a kovetkezo fejleszteseket tartalmazza:

1. Mindenki megkapja mind a 3 emlekeztetot (60, 50, 40 nap) - nem valaszthat
2. Email sablonok tarolasa adatbazisban, admin feluleten szerkesztheto
3. check-reminders es send-reminder-email edge function-ok atirasa (60/50/40 nap, sablon-alapu, cron-kompatibilis)
4. Email kovetes: megnyitas, kattintas, visszahivas/ajanlat keres
5. Admin email naplo felulet
6. Uj CTA gombok az emailekben (visszahivas, szemelyes ajanlat)
7. Kuldo cim: `noreply@digitalisbirodalom.hu` (minden edge function-ben)
8. Email hitelesites (regisztracio) javitasa

---

## Adatbazis migraciok

### 1. `email_templates` tabla

Uj tabla az email sablonok tarolasara:

| Oszlop | Tipus | Leiras |
|--------|-------|--------|
| id | uuid (PK) | |
| template_key | text UNIQUE | "reminder_60_days", "reminder_50_days", "reminder_40_days" |
| subject | text | Email targya, placeholder-ekkel |
| body_html | text | HTML tartalom, placeholder-ekkel |
| description | text | Admin leiras |
| created_at | timestamptz | |
| updated_at | timestamptz | |

RLS: csak admin olvashat/irhat (has_role check).

Seed data: 3 sablon (60, 50, 40 napos), a jelenlegi hardcode-olt HTML-bol generalva, de az uj CTA gombokkal kiegeszitve. Placeholder-ek: `{{nev}}`, `{{rendszam}}`, `{{auto_becenev}}`, `{{marka}}`, `{{modell}}`, `{{evjarat}}`, `{{evfordulo}}`, `{{hatra_nap}}`, `{{eves_dij}}`, `{{megtakaritas}}`, `{{dashboard_url}}`, `{{beallitasok_url}}`, `{{visszahivas_url}}`, `{{ajanlat_url}}`, `{{tracking_pixel_url}}`.

### 2. `reminder_logs` tabla bovitese

Uj oszlopok:

| Oszlop | Tipus | Default |
|--------|-------|---------|
| user_email | text | null |
| user_name | text | null |
| car_nickname | text | null |
| license_plate | text | null |
| link_clicked | boolean | false |
| callback_requested | boolean | false |
| offer_requested | boolean | false |

---

## Edge Function valtozasok

### `check-reminders` atiras
- Reminder napok: 60, 50, 40 (jelenleg 50, 30, 7)
- Eltavolitjuk az admin auth ellenorzest - a cron job service role key-vel hivja
- Nem nezi a felhasznalo `reminder_days` beallitasat, csak az `email_reminders_enabled` flaget
- A `send-reminder-email`-t service role key-vel hivja

### `send-reminder-email` atiras
- Reminder tipusok: "60_days", "50_days", "40_days" (jelenleg "50_days", "30_days", "7_days")
- A sablon az `email_templates` tablabol jon (template_key alapjan)
- Placeholder-ek automatikus csereje a felhasznalo/auto adataival
- Tracking pixel URL beilesztese
- CTA gombok: "Visszahivast kerek", "Szemelyes ajanlatot kerek" (tracking URL-ekkel)
- Kuldo: `LegolcsobbKotelezo <noreply@digitalisbirodalom.hu>`
- `reminder_logs`-ba mentes: user_email, user_name, car_nickname, license_plate
- Nem var admin auth-ot, hanem service role key-t (a check-reminders hivja)

### `send-email-confirmation` frissites
- Kuldo cim: `noreply@digitalisbirodalom.hu` (a FROM_EMAIL env var mar be van allitva, de ha nincs, fallback)
- A RESEND_FROM secret mar `noreply@digitalisbirodalom.hu` erteku, tehat automatikusan jo

### `send-password-reset` frissites
- Kuldo cim: `noreply@digitalisbirodalom.hu` (ugyanaz mint fent)

### Uj: `track-email-open`
- GET kerest kap (tracking pixel)
- Query param: `log_id`
- Frissiti a `reminder_logs.email_opened = true`-ra
- Visszaad egy 1x1 atlatszs GIF-et
- verify_jwt = false

### Uj: `track-email-click`
- GET kerest kap
- Query paramek: `log_id`, `url` (cel URL)
- Frissiti `reminder_logs.link_clicked = true`
- 302 redirect a cel URL-re
- verify_jwt = false

### Uj: `email-action`
- GET kerest kap
- Query paramek: `log_id`, `action` ("callback" vagy "offer")
- Frissiti `reminder_logs.callback_requested` vagy `offer_requested = true`
- Atiranyit egy koszonoet/visszajelzes oldalra
- verify_jwt = false

---

## Frontend valtozasok

### `DashboardSettings.tsx`
- Eltavolitjuk az "Emlekeztetoe idozitese" szekciot (60/50/40 napos checkbox-ok)
- Megmarad az "Email emlekeztetok" fo kapcsolo
- Megmarad a "Szemelyes megkereses" kapcsolo
- Az "Ertesitesek mentese" gomb csak az `email_reminders_enabled` flaget menti

### Uj: `src/pages/AdminEmailTemplates.tsx`
- Admin oldal a 3 email sablon szerkesztesehez
- Minden sablonhoz: targy (subject) es HTML tartalom (body_html) szerkeszto
- A HTML tartalomhoz a meglevo RichTextEditor komponenst hasznaljuk
- Placeholder lista referenciaval
- Elonezet gomb (iframe-ben megjelenik az email)
- Mentes gomb

### Uj: `src/pages/AdminEmailLogs.tsx`
- Tablazatos nezet az elkuldott emailekrol
- Oszlopok: Datum, Cimzett neve, Email, Auto, Tipus (60/50/40), Megnyitva, Kattintott, Visszahivas, Ajanlat
- Szures: datum tartomany, tipus, megnyitas statusz
- Bovebb informacio dialog

### Uj: `src/hooks/useEmailTemplates.ts`
- CRUD muveletek az `email_templates` tablara

### Uj: `src/hooks/useEmailLogs.ts`
- Lekerdezesek a `reminder_logs` tablara (admin szamara)

### `DashboardLayout.tsx`
- Uj admin menupontok:
  - "Email sablonok" (Mail ikon) -> `/admin/email-templates`
  - "Email naplo" (History ikon) -> `/admin/email-logs`

### `App.tsx`
- Uj route-ok:
  - `/admin/email-templates` -> AdminEmailTemplates
  - `/admin/email-logs` -> AdminEmailLogs

### Uj: `src/pages/EmailActionConfirmation.tsx`
- Egyszeru "Koszonjuk" oldal, ahova az email CTA gombjai iranyitanak
- Route: `/email-action-confirm`

---

## Spam problema kezelese

A kovetkezo valtozasokat vegezzuk a kodban:
- Minden edge function `noreply@digitalisbirodalom.hu` cimrol kuld (a `RESEND_FROM` secret mar be van allitva)
- Az email tartalomban kerulni kell a spam-jelzoket

A kovetkezo lepeseket Neked kell megtenned a Resend-ben (nem kod):
1. Resend dashboard-on: `digitalisbirodalom.hu` domain hitelesitese (SPF, DKIM, DMARC DNS rekordok)
2. Ez utan az emailek nem kerulnek spam-be

---

## Megvalositasi sorrend

1. Adatbazis migraciok (email_templates tabla, reminder_logs bovites, RLS)
2. DashboardSettings egyszerusitese
3. Edge function-ok: check-reminders, send-reminder-email atiras
4. Edge function-ok: track-email-open, track-email-click, email-action (uj)
5. Edge function-ok: send-email-confirmation, send-password-reset kuldo cim frissites
6. Admin feluletek: AdminEmailTemplates, AdminEmailLogs (+ hooks)
7. DashboardLayout menu bovites, App.tsx routing
8. EmailActionConfirmation oldal
9. config.toml frissites az uj edge function-okhoz

