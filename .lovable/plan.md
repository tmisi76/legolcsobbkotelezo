

# Terv: Rich Text szerkesztő az admin oldalszerkesztőbe

## Probléma
Jelenleg a tartalomszerkesztő egy sima HTML textarea, ami nem felhasználóbarát. Az admin nyers HTML kódot lát a szerkesztőben.

## Megoldás
A **TipTap** rich text editort integráljuk a PageEditorDialog-ba. A TipTap egy headless, React-kompatibilis szerkesztő, ami HTML-t generál kimenetként -- tehát a jelenlegi adatbázis struktúra (HTML content) változatlan marad.

---

## Lépések

### 1. TipTap csomagok telepítése
- `@tiptap/react` - React integráció
- `@tiptap/starter-kit` - alap funkciók (fejlécek, listák, félkövér, dőlt, stb.)
- `@tiptap/extension-underline` - aláhúzás

### 2. RichTextEditor komponens létrehozása
**Fájl:** `src/components/admin/RichTextEditor.tsx`

Tartalmaz:
- **Eszköztár** (toolbar) gombokkal: Fejléc (H2, H3), Félkövér, Dőlt, Aláhúzás, Felsorolás, Számozott lista
- **Szerkesztő terület** - WYSIWYG nézet, ahol a szöveg úgy jelenik meg, ahogy az oldalon is fog
- Props: `content` (bemeneti HTML), `onChange` (HTML kimenetet ad vissza)

### 3. PageEditorDialog módosítása
**Fájl:** `src/components/admin/PageEditorDialog.tsx`

- A `<Textarea>` komponenst lecseréljük a `<RichTextEditor>`-ra
- A "Tartalom (HTML)" felirat helyett "Tartalom" lesz
- Minden más (cím, slug, publikálás, mentés) változatlan marad

---

## Technikai részletek

### Eszköztár gombjai
| Gomb | Funkció | TipTap parancs |
|------|---------|---------------|
| **H2** | Alcím | toggleHeading({ level: 2 }) |
| **H3** | Kisebb cím | toggleHeading({ level: 3 }) |
| **B** | Félkövér | toggleBold() |
| *I* | Dőlt | toggleItalic() |
| U | Aláhúzás | toggleUnderline() |
| Lista | Felsorolás | toggleBulletList() |
| 1. | Számozott lista | toggleOrderedList() |

### Stílus
- Az eszköztár gombjai a meglévő shadcn Toggle komponenst használják
- A szerkesztő terület a `prose` Tailwind osztályokkal lesz formázva (a `@tailwindcss/typography` plugin mar telepítve van)
- Keretezés, háttér konzisztens a meglévő input/textarea stílussal

### Kompatibilitás
- A TipTap HTML-t ad kimenetként, ami pont az, amit az adatbázisban tárolunk
- A meglévő tartalom (ami eddig nyers HTML-ként lett megírva) automatikusan betöltődik a szerkesztőbe formázottan
- Nem kell adatbázis migrációt csinálni

---

## Érintett fájlok

| Fájl | Változtatás |
|------|-------------|
| `package.json` | 3 új csomag: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-underline |
| `src/components/admin/RichTextEditor.tsx` | Új: rich text szerkesztő komponens |
| `src/components/admin/PageEditorDialog.tsx` | Textarea csere RichTextEditor-ra |
