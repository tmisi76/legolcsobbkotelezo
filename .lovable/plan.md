
# Hibajavitasi terv - Ugyfel altal talalt problemak

## Osszefoglalo
Az ugyfel altal jelzett hibak:
1. Email sablon szerkeszto - mar folyamatban (elozo uzenetek)
2. Footer linkek nem jelennek meg a kulsos oldalon
3. Admin "Potencialis szerzodok" oldalon meg latszik a becenev
4. Regisztracio: dupla email, linkek ugyanabban az ablakban nyilnak, hibauzenet
5. Napszamitas 1 nappal elcsuszva (UTC timezone bug)

---

## 1. Footer linkek nem jelennek meg a kulsos oldalon

**Problema:** A kulsos oldal Footer komponense a `menu_items` tablabol toltodik `position="footer"` szuressel. Ha az admin a Tartalom fulnel letrehoz egy oldalt es publikalja, az automatikusan nem kerul be a footer menu elemek koze -- ezeket kulon kell felvenni a MenuItemsManager-ben.

**Megoldas:** A Footer-be a `menu_items` mellett a publikalt `pages` tablabol is megjelenitsuk a linkeket. Igy ha egy oldal publikalt, automatikusan megjelenik a Footer-ben (pl. Adatvedelmi Tajekoztato, ASZF, GYIK, Impresszum, Kapcsolat).

**Erintett fajl:** `src/components/Footer.tsx`
- A meglevo `useMenuItems("footer")` melle behuzzuk a publikalt oldalakat is (`usePages` hook)
- A Footer linkek koze beillesztjuk az osszes publikalt oldalt, aminek van slug-ja

---

## 2. Becenev eltavolitasa az admin oldalrol

**Problema:** A "Potencialis szerzodok" tablazatban es a reszletes dialogusban meg megjelenik a `nickname` mezo, holott azt mar nem keri be a rendszer (automatikusan `brand + model`).

**Erintett fajlok:**

**`src/pages/AdminClients.tsx` (460-463. sor):**
- A tablazatban a `car.nickname` helyett kozvetlenul `car.brand car.model` jelenik meg
- Az alatta levo `car.brand car.model (car.year)` sort atirjuk csak `car.year` vagy eltavolitjuk a duplikaciòt

**`src/components/admin/CarDetailsDialog.tsx` (301-303. sor):**
- Az "Auto adatai" szekciobol eltavolitjuk a "Becenev" mezot
- A dialog cimsorbol (214. sor) a `car.nickname` helyett `car.brand car.model`

---

## 3. Regisztracio javitasok

### 3a. Dupla email regisztracio megakadalyozasa
**Problema:** Ugyanazzal az email cimmel tobbszor is lehet regisztralni.

**Erintett fajl:** `supabase/functions/send-email-confirmation/index.ts`
- A `generateLink({ type: "signup" })` hivas elott ellenorizzuk, hogy letezik-e mar felhasznalo az adott email cimmel
- Ha igen, visszaadjuk a hibaüzenetet: "Ez az email cim mar regisztralva van. Ha elfelejtetted a jelszavad, hasznald az elfelejtett jelszo funkciót."

### 3b. ASZF es Adatvedelem linkek uj ablakban
**Problema:** A regisztracios oldalon az Adatvedelmi szabalyzat es ASZF linkek ugyanabban az ablakban nyilnak meg, igy az ügyfél elvesziti a mar beirt adatokat.

**Erintett fajl:** `src/pages/Register.tsx` (282-288. sor)
- A `<Link to="/adatvedelem">` es `<Link to="/aszf">` elemeket `<a href="..." target="_blank" rel="noopener noreferrer">` elemekre csereljuk

---

## 4. Napszamitas javitasa (off-by-one bug)

**Problema:** A napszamitas 1 nappal elcsuszhat, mert a `new Date('2026-02-19')` JavaScript-ben UTC idozonaban ertelmezheto (ejfel UTC), ami CET idozonaban (Magyarorszag) az elozo nap 23:00-nak felel meg. Igy a `setHours(0,0,0,0)` utana februar 18-at ad februar 19 helyett.

**Megoldas:** A datum-string-ek parszolasanal explicit lokalis idot hasznalunk, pl. `new Date('2026-02-19T00:00:00')` (T idovel mar lokalisan ertelmezheto), vagy manualis parsolas: `new Date(year, month-1, day)`.

**Erintett fajlok:**

**`src/lib/carStatus.ts`:**
- `calculateCarStatus` fuggveny (20-21. sor): `new Date(anniversaryDate)` lecserelese helyes lokalis parszolasra
- `getTimelineMarkers` fuggveny (101. sor): ugyanaz

**`src/lib/database.ts`:**
- `getDaysUntilAnniversary` fuggveny (153-154. sor): ugyanaz
- `formatHungarianDate` fuggveny (180. sor): ugyanaz

**`src/pages/AdminClients.tsx`:**
- `getDaysUntilAnniversary` fuggveny (168. sor): `parseISO` mar hasznalva, de a `new Date(today.getFullYear(), ...)` resznel is kell figyelni

**Segedfiggveny letrehozasa:**
```typescript
// Helyes datum parsolas timezone-problemak elkerulesehez
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}
```

---

## Osszefoglalas

| # | Hiba | Fajl(ok) | Suly |
|---|------|----------|------|
| 1 | Footer linkek | Footer.tsx | Kozep |
| 2 | Becenev admin | AdminClients.tsx, CarDetailsDialog.tsx | Konnyu |
| 3a | Dupla regisztracio | send-email-confirmation/index.ts | Kozep |
| 3b | Linkek uj ablakban | Register.tsx | Konnyu |
| 4 | Nap off-by-one | carStatus.ts, database.ts, AdminClients.tsx | Fontos |
