

# Terv: Email szerkeszto javitas + becenev eltavolitasa

## 1. problema: A szerkesztoben nem lehet gepelni

### Ok
A jelenlegi `EmailVisualEditor`-ban korkoros frissites tortenik:
1. A felhasznalo beir egy betut az iframe-be
2. A `MutationObserver` eloall es meghivja `onChange(newHtml)` -- ez frissiti a szulo `editBodies` state-et
3. A szulo ujrarendereli a komponenst uj `html` prop-pal
4. Az `useEffect` erzeekeli, hogy a `html` prop valtozott, es **felulirja az iframe tartalmat** (`doc.body.innerHTML = html`)
5. Ez tovabbi MutationObserver esemenyeket valt ki, es a kurzor pozicioja is elveszik

### Megoldas
- Az `onChange`-bol kiadott HTML-t eltaroljuk egy `lastInternalHtmlRef`-ben
- Az `useEffect`-ben csak akkor irjuk felul az iframe tartalmat, ha a `html` prop **kulso** forrasbol valtozott (pl. HTML ful), es nem az iframe sajat szerkesztesebol
- Igy a gepeles zavartalan marad, a kurzor pozicioja megmarad

### Erintett fajl
- `src/components/admin/EmailVisualEditor.tsx`

### Valtozasok reszletesen
- Uj ref: `lastInternalHtmlRef` ami tarolja az iframe-bol utoljara kiolvasott HTML-t
- Az `onChange` hivaskor beallitjuk: `lastInternalHtmlRef.current = newHtml`
- Az `useEffect`-ben: ha `html === lastInternalHtmlRef.current`, akkor kihagyjuk a frissitesy (sajat valtozas)
- Csak akkor irjuk at az iframe-et, ha a html prop tenyleg mas forrasbol jott

---

## 2. problema: Gepjarmu becenev eltavolitasa

A `nickname` mezo automatikusan generalodik (`brand + model`), nem keri be a rendszer kulon. Viszont az email sablonok placeholderei kozott meg szerepel a `{{auto_becenev}}`.

### Valtozasok

**`src/pages/AdminEmailTemplates.tsx`:**
- Eltavolitjuk a `{{auto_becenev}}` sort a `PLACEHOLDERS` tombbol
- Eltavolitjuk a `getPreviewHtml` fuggvenybol az `auto_becenev` cseret

**`supabase/functions/send-reminder-email/index.ts`:**
- Az `auto_becenev` placeholder erteket atallihtjuk `brand + model`-re (pl. "Toyota Corolla") a kulon nickname helyett, igy ha valaki mar hasznalja a placeholdert a sablonban, az sem torik el -- de a placeholder listaban mar nem jelenik meg ujkent

---

## Osszefoglalas

| Fajl | Valtozas |
|------|----------|
| `src/components/admin/EmailVisualEditor.tsx` | Korokoros frissites javitasa `lastInternalHtmlRef`-fel |
| `src/pages/AdminEmailTemplates.tsx` | `auto_becenev` placeholder eltavolitasa a listabol es az elonezetbol |
| `supabase/functions/send-reminder-email/index.ts` | `auto_becenev` erteket `brand + model`-re allitjuk |

