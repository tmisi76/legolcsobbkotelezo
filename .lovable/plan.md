

# Terv: Admin oldali tartalomkezelő rendszer (CMS)

## Cel

Egy egyszerű tartalomkezelő rendszer (CMS) kialakítása, amellyel az admin felhasználók szerkeszthetik a meglévő oldalakat (GYIK, ÁSZF, Adatvédelem), új oldalakat hozhatnak létre (Kapcsolat, Impresszum, Munkatársaink), és dinamikusan kezelhetik a menüpontokat.

---

## 1. Adatbázis (2 új tábla)

### `pages` tábla
Az oldalak tartalmát tárolja.

| Oszlop | Típus | Leírás |
|--------|-------|--------|
| id | uuid | Elsődleges kulcs |
| slug | text (unique) | URL slug, pl. "aszf", "kapcsolat" |
| title | text | Oldal címe, pl. "ÁSZF" |
| content | text | Oldal tartalma (HTML formátumban) |
| is_published | boolean | Publikálva van-e |
| created_at | timestamptz | Létrehozás ideje |
| updated_at | timestamptz | Utolsó módosítás |

### `menu_items` tábla
A dinamikus menüpontokat tárolja (footer, navbar stb.).

| Oszlop | Típus | Leírás |
|--------|-------|--------|
| id | uuid | Elsődleges kulcs |
| label | text | Megjelenő felirat, pl. "Kapcsolat" |
| slug | text | Hivatkozott oldal slug-ja |
| position | text | Hol jelenjen meg: "footer", "navbar" |
| sort_order | integer | Sorrend |
| is_visible | boolean | Látható-e |
| created_at | timestamptz | Létrehozás ideje |

### RLS szabályok
- **Olvasás:** mindenki (publikus oldalak)
- **Írás/Módosítás/Törlés:** csak admin (`has_role(auth.uid(), 'admin')`)

---

## 2. Admin felület: Tartalomkezelés

Új admin oldal: `/admin/pages`

### Funkciók:
- **Oldalak listája:** Táblázatban megjelenik az összes oldal (cím, slug, státusz, utolsó módosítás)
- **Oldal szerkesztése:** Dialógus ablakban szerkeszthető a cím és a tartalom (egyszerű szövegszerkesztő)
- **Új oldal létrehozása:** Ugyanez a dialógus, üres mezőkkel
- **Oldal törlése:** Megerősítő dialógus után
- **Menüpont-kezelés:** Melyik oldalak jelenjenek meg a footerben, milyen sorrendben

### Szerkesztő
Egyszerű textarea-alapú HTML szerkesztő (a jelenlegi ÁSZF/Adatvédelem stílusával konzisztens). A tartalom szekciókra bontva (h2 címsor + bekezdések) jelenik meg.

---

## 3. Alapértelmezett oldalak betöltése

Az első migráció létrehozza az alap oldalakat a jelenlegi hardcoded tartalommal:

- **GYIK** (slug: "gyik") - a jelenlegi FAQ kérdés-válaszok JSON formátumban
- **ÁSZF** (slug: "aszf") - a jelenlegi ASZF.tsx tartalma
- **Adatvédelmi tájékoztató** (slug: "adatvedelem") - a jelenlegi Adatvedelem.tsx tartalma
- **Kapcsolat** (slug: "kapcsolat") - új, H-Kontakt Group elérhetőségei
- **Impresszum** (slug: "impresszum") - új, cégadatok
- **Munkatársaink** (slug: "munkatarsaink") - új, üres sablon

---

## 4. Frontend oldalak dinamizálása

### Dinamikus oldal komponens
Új komponens: `DynamicPage.tsx`
- A slug alapján betölti az adatbázisból az oldal tartalmát
- Navbar + Footer keretben jeleníti meg
- 404-et mutat, ha nem létezik vagy nincs publikálva

### Módosítandó komponensek:
| Fájl | Változtatás |
|------|-------------|
| `src/pages/ASZF.tsx` | Dinamikus tartalomra cserélés (adatbázisból) |
| `src/pages/Adatvedelem.tsx` | Dinamikus tartalomra cserélés |
| `src/components/FAQSection.tsx` | GYIK adatok adatbázisból |
| `src/components/Footer.tsx` | Menüpontok adatbázisból |
| `src/App.tsx` | Új route-ok: `/kapcsolat`, `/impresszum`, `/munkatarsaink`, `/oldal/:slug` (catch-all dinamikus) |

---

## 5. Admin menü bővítése

A `DashboardLayout.tsx` admin menüjébe új menüpont:
- **Tartalom** (ikon: FileEdit) --> `/admin/pages`

---

## 6. Új fájlok

| Fájl | Leírás |
|------|--------|
| `src/pages/AdminPages.tsx` | Admin tartalomkezelő oldal |
| `src/components/admin/PageEditorDialog.tsx` | Oldal szerkesztő dialógus |
| `src/components/admin/MenuItemsManager.tsx` | Menüpont-kezelő komponens |
| `src/pages/DynamicPage.tsx` | Dinamikus oldal megjelenítő |
| `src/hooks/usePages.ts` | Oldalak lekérdezése hook |
| `src/hooks/useMenuItems.ts` | Menüpontok lekérdezése hook |

---

## 7. Prioritás és sorrend

1. Adatbázis migrációk (pages, menu_items táblák + RLS + seed data)
2. Hook-ok (usePages, useMenuItems)
3. Admin oldal (AdminPages + PageEditorDialog + MenuItemsManager)
4. DynamicPage komponens
5. Meglévő oldalak átalakítása (ÁSZF, Adatvédelem, GYIK)
6. Footer dinamizálása
7. Routing frissítése (App.tsx)
8. Admin menü bővítése (DashboardLayout)

---

## Technikai megjegyzések

- A GYIK oldal speciális: kérdés-válasz párok JSON-ként tárolódnak a `content` mezőben, a `FAQSection` komponens ezt parse-olja
- A szerkesztő egyszerű textarea lesz (nem rich text editor), mert a tartalom HTML formátumú, de a struktúra egységes (szekciók, bekezdések, listák)
- A menüpont-kezelő drag-and-drop nélkül működik, sorrendet számmal lehet beállítani
- Az admin a "Publikálás" kapcsolóval tudja szabályozni, hogy egy oldal látható-e a nyilvánosság számára

