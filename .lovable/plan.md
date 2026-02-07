
## Probléma oka (már azonosítható a logokból)
A jelszó-visszaállító “küldés” valójában lefut, a recovery link is legenerálódik, viszont az email elküldése **Resend oldalon elhasal**:

- Hiba: `403 The legolcsobbkotelezo.hu domain is not verified`
- Ok: a `send-password-reset` funkció jelenleg ezt használja feladóként:
  - `LegolcsóbbKötelező <noreply@legolcsobbkotelezo.hu>`
  - ezt a domaint a Resend fiókban még nem verifikáltátok, ezért Resend blokkolja a küldést.

Közben a reminder emailek azért mennek ki, mert ott a feladó:
- `LegolcsóbbKötelező <onboarding@resend.dev>`
ami Resend “teszt/általános” feladóként használható domain-verifikáció nélkül.

---

## Cél
Ha a user jelszóemlékeztetőt kér, **ténylegesen menjen ki az email**, és a link a publikus reset oldalra vigyen.

---

## Megoldás (gyors, biztos fix)
### 1) `send-password-reset` funkcióban a feladó javítása
**Fájl:** `supabase/functions/send-password-reset/index.ts`

- A `from` mezőt átállítjuk ugyanarra a feladóra, amit a reminder funkció is használ:
  - `LegolcsóbbKötelező <onboarding@resend.dev>`

Ezzel:
- azonnal megszűnik a 403-as blokkolás,
- a jelszó-visszaállító email ki fog menni domain verifikáció nélkül is.

---

## Opcionális, “profi” megoldás (hogy később saját domainről menjen)
### 2) Feladó cím konfigurálhatóvá tétele
**Fájl:** `supabase/functions/send-password-reset/index.ts`

- Bevezetünk egy opcionális környezeti változót (secretet), pl. `RESEND_FROM`
- Logika:
  - ha `RESEND_FROM` létezik -> azt használjuk
  - különben fallback -> `onboarding@resend.dev`

Így:
- most azonnal működik (fallback)
- később, ha verifikáljátok a domaint Resend-ben, csak beállítjátok a `RESEND_FROM`-ot pl. `noreply@legolcsobbkotelezo.hu`-ra, és kész.

---

## Opcionális finomítások (nem kötelezőek, de javasoltak)
### 3) E-mail sablon footer link egységesítése
A password reset emailben jelenleg a footerben `.lovable.app` link van.
Javaslat: átállítani a publikus domainre (pl. `legolcsobbkotelezo.hu`), hogy egységes legyen a brand.

### 4) “Operational” log javítás
Most a function biztonsági okból mindig success üzenetet ad vissza (email enumeráció ellen).
Ezt megtartjuk, viszont:
- logolunk egyértelműen Resend küldési hibát (már most is van),
- így ha valami megint elromlik, könnyű visszanézni.

---

## Teszt terv (amit a javítás után végigcsinálunk)
1) Kérj jelszóemlékeztetőt a `horvath.jozsef@h-kontakt.hu` címre
2) Ellenőrizzük, hogy a backend logban már **nincs 403**
3) Megnézed a bejövő levelek közt + spam/promóciók fülön
4) Rákattintasz a linkre, és a `https://legolcsobbkotelezo.lovable.app/reset-password` oldalon be tudod állítani az új jelszót

---

## Érintett fájlok
- Kötelező:
  - `supabase/functions/send-password-reset/index.ts` (from cím javítása)
- Opcionális:
  - ugyanitt: `RESEND_FROM` támogatás + footer link finomítás

---

## Várható eredmény
A jelszó-visszaállító emailek azonnal ki fognak menni Resend-del, és a user tényleg meg fogja kapni a levelet (nem csak “Email elküldve” UI üzenetet fog látni).
