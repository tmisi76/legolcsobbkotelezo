
# Terv: Footer menü egyszerűsítése és jogi oldalak frissítése

## Összefoglaló
A lábléc menüt lecsökkentjük 2 elemre (Adatvédelem és ÁSZF), a többi oldalt (Impresszum, Jogi nyilatkozat, Kapcsolat) eltávolítjuk, és a megmaradó két oldal tartalmát frissítjük a H-Kontakt Group Kft. adataival.

## Változtatások

### 1. Footer.tsx - Menüpontok csökkentése
A jelenlegi 5 linkből (Adatvédelem, ÁSZF, Impresszum, Jogi nyilatkozat, Kapcsolat) csak 2 marad:
- Adatvédelem
- ÁSZF

### 2. Adatvedelem.tsx - Teljes tartalom frissítése
Új, részletes adatvédelmi tájékoztató a cég adataival:

**Adatkezelő:**
- H-Kontakt Group Kft
- Székhely: 8900 Zalaegerszeg, Tompa Mihály u. 1-3. 1. emelet (a Göcsej Üzletházban)
- Telefon: 06-20-441-5868
- Email: info@h-kontakt.hu

**Tartalmi struktúra:**
1. Adatkezelő - cégadatok
2. Kezelt adatok köre
3. Adatkezelés célja
4. Adatkezelés jogalapja (GDPR)
5. Adatok tárolása és biztonsága
6. Érintetti jogok
7. Cookie-k használata
8. Kapcsolat

### 3. ASZF.tsx - Teljes tartalom frissítése
Új, részletes ÁSZF a cég adataival:

**Szolgáltató:**
- H-Kontakt Group Kft
- Székhely: 8900 Zalaegerszeg, Tompa Mihály u. 1-3. 1. emelet (a Göcsej Üzletházban)
- Telefon: 06-20-441-5868
- Email: info@h-kontakt.hu

**Tartalmi struktúra:**
1. Szolgáltató adatai - teljes cégadatok
2. A szolgáltatás leírása
3. Regisztráció
4. A szolgáltatás díja
5. Felelősség
6. Szerződés megszüntetése
7. Alkalmazandó jog
8. Módosítások

### 4. App.tsx - Route-ok törlése
Eltávolítandó route-ok és importok:
- `/kapcsolat` - Kapcsolat
- `/impresszum` - Impresszum
- `/jogi-nyilatkozat` - JogiNyilatkozat

### 5. Törlendő fájlok
- `src/pages/Kapcsolat.tsx`
- `src/pages/Impresszum.tsx`
- `src/pages/JogiNyilatkozat.tsx`

---

## Technikai részletek

### Érintett fájlok

| Fájl | Művelet |
|------|---------|
| `src/components/Footer.tsx` | Szerkesztés - 3 link törlése |
| `src/pages/Adatvedelem.tsx` | Szerkesztés - tartalom csere |
| `src/pages/ASZF.tsx` | Szerkesztés - tartalom csere |
| `src/App.tsx` | Szerkesztés - 3 route és import törlése |
| `src/pages/Kapcsolat.tsx` | Törlés |
| `src/pages/Impresszum.tsx` | Törlés |
| `src/pages/JogiNyilatkozat.tsx` | Törlés |

### Footer struktúra (új)

```text
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] LegolcsóbbKötelező          Adatvédelem    ÁSZF        │
├─────────────────────────────────────────────────────────────────┤
│  © 2026 LegolcsóbbKötelező.hu - Minden jog fenntartva          │
│  Független biztosítási alkusz - emlékeztetünk, hogy spórolhass!│
└─────────────────────────────────────────────────────────────────┘
```
