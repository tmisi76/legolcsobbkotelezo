
# Harom hiba javitasa - Barbara ügyfél visszajelzese

## 1. Email sablon szerkeszto: dupla mentes szukseges

### Problema
Mentes utan a `handleSave` torli az `editBodies[id]` erteket (86-87. sor, AdminEmailTemplates.tsx). Igy a komponens visszaesik a `template.body_html` ertekre, ami meg a REGI ertek a szerverrol, amig a `queryClient.invalidateQueries` nem frissiti. Ez az `EmailVisualEditor`-nak kulso valtozaskent erkezik, es visszaallitja az iframe tartalmat a regi HTML-re.

### Megoldas
A `handleSave` sikere utan NE toroljuk az `editBodies` erteket, amig a query nem frissul. Egyszerubb megoldas: a `handleSave`-ben a `mutateAsync` utan varjunk a query ujratolteseig, es UTANA toroljuk az edit state-et. Vagy: a torles helyet az `editBodies`-t allitsuk a mentett ertekre, ne toroljuk.

**Erintett fajl:** `src/pages/AdminEmailTemplates.tsx` (86-87. sor)
- Mentes utan az `editBodies[id]`-t allitsuk az elmentett ertekre ahelyett, hogy toroljuk
- Igy a szerkeszto nem ugrik vissza a regi sablonra

### Valtozas
```
// ELOTTE (86-87. sor):
setEditSubjects(prev => { const n = { ...prev }; delete n[id]; return n; });
setEditBodies(prev => { const n = { ...prev }; delete n[id]; return n; });

// UTANA:
// Ne toroljuk, tartsuk meg a mentett erteket amig a query frissul
```

Az `onSuccess` callback a `useUpdateEmailTemplate`-ben mar hivja az `invalidateQueries`-t, de a valasz megindulasaig a regi `template.body_html` lenne hasznalatban. Ha megtartjuk az `editBodies`-ben az erteket, ez a problema nem all fenn.

---

## 2. Footer: GYIK link nem mukodik + lablec bejelentkezes utan is latszodjon

### 2a. GYIK link
A `pages` tablaban letezik egy `gyik` slug-u publikalt oldal. A Footer linkeli `/gyik`-re. DE az `App.tsx`-ben nincs `/gyik` route -- csak `/kapcsolat`, `/impresszum`, `/munkatarsaink` van fix route-kent, es `/oldal/:slug` a dinamikus. A `/gyik` a catch-all `*` route-ra esik, ami `NotFound`.

**Megoldas:** Ket lehetoseg:
- A) Felvenni a `/gyik` route-ot is a fix route-ok koze (`<Route path="/gyik" element={<DynamicPage />} />`), VAGY
- B) A Footer-ben a linkek `/oldal/${page.slug}` formatumban legyenek (ez a dinamikus route), VAGY
- C) A catch-all elott egy altalanos `/:slug` route-ot felvenni

A legjobb megoldas: a hianyzo slugokra (`gyik` es barmi mas uj oldal) is adjunk route-ot. Legegyszerubb: vegyunk fel egy `/:slug` route-ot a `*` catch-all ele, ami a `DynamicPage`-et rendereli. Igy MINDEN publikalt oldal elerheto kozvetlenul `/{slug}` URL-en.

**Erintett fajl:** `src/App.tsx`
- A `*` catch-all ELOTT felvenni: `<Route path="/:slug" element={<DynamicPage />} />`
- A DynamicPage mar kezel slug paramot (`useParams`), es ha nem letezik az oldal, `NotFound`-ot mutat

**Erintett fajl:** `src/pages/DynamicPage.tsx`
- Mar kezel `paramSlug`-ot es `location.pathname`-et, de a `:slug` route-nal a `paramSlug` lesz kitoltve, tehat mukodni fog

### 2b. Footer bejelentkezes utan
Jelenleg a bejelentkezett felhasznalokat a `HomeRoute` atiranyitja `/dashboard`-ra, ami a `DashboardLayout`-ot hasznalja -- itt NINCS Footer. A Dashboard oldalak nem is tartalmaznak Footer-t.

**Megoldas:** A `DashboardLayout` aljara tegyuk be a Footer komponenst. Igy minden dashboard oldalon megjelenik a lablec.

**Erintett fajl:** `src/components/dashboard/DashboardLayout.tsx`
- A `</main>` utan, a mobil bottom nav elott, beszurni a `<Footer />` komponenst a fo tartalomteruleten belul

---

## 3. Bejelentkezes utani toast: "Udvozlunk vissza!" -> "Udvozlunk!"

### Problema
A Login.tsx 56. soran a toast `description` erteke "Udvozlunk vissza!", de az ugyfel szerint "Udvozlunk!"-nak kellene lennie.

FONTOS: Az ugyfel azt irja, hogy "Udvozlunk vissza!"-t kellene kiirnia, NEM azt, hogy "Udvozlunk!"-t. Tehat a jelenlegi "Udvozlunk vissza!" mar HELYES. Ez a pont mar RENDBEN VAN, nincs szukseg valtoztatasra.

---

## Osszefoglalo

| # | Hiba | Fajl(ok) | Valtozas |
|---|------|----------|----------|
| 1 | Dupla mentes | AdminEmailTemplates.tsx | editBodies ne torlodjon mentes utan |
| 2a | GYIK link 404 | App.tsx | /:slug catch-all route hozzaadasa |
| 2b | Footer dashboard utan | DashboardLayout.tsx | Footer komponens beillesztese |
| 3 | Bejelentkezes toast | - | Mar helyes, nincs teendo |
