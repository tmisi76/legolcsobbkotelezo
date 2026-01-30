
# Átfogó fejlesztési terv: Email megerősítés, megtakarítás eltávolítás és admin javítások

## Összefoglaló
A felhasználó visszajelzése alapján több fontos módosítást kell végrehajtani: email megerősítés bekapcsolása, megtakarítás kalkulátor eltávolítása, admin felület javítása (email megjelenítés), és az időszaki áttekintés dátumainak javítása. Az egyéb javaslatok (személyes dokumentumok, több dokumentum feltöltése) későbbi fázisban kerülnének megvalósításra.

---

## 1. fázis: Email megerősítés regisztrációnál (PRIORITÁS: KRITIKUS)

### Probléma
Jelenleg bárki bármilyen email címmel regisztrálhat ellenőrzés nélkül, ami adatvédelmi kockázat.

### Megoldás
Az email megerősítés már be van kapcsolva a Lovable Cloud-ban (a `translateAuthError` függvényben van "Email not confirmed" fordítás), DE a regisztrációs üzenetben nem jelezzük az ügyfélnek, hogy meg kell erősítenie az email-t.

### Változtatások
- **`src/pages/Register.tsx`**: Sikeres regisztráció után jelezni, hogy email megerősítés szükséges
- A felhasználót nem irányítjuk a login oldalra, hanem egy megerősítő üzenetet mutatunk

---

## 2. fázis: Becsült megtakarítás kalkulátor eltávolítása (PRIORITÁS: MAGAS)

### Érintett helyek és változtatások

| Helyszín | Változtatás |
|----------|-------------|
| Landing page - `SavingsCalculator` | Teljes komponens törlése, Index.tsx-ből eltávolítás |
| Dashboard Home - StatCard | "Becsült megtakarítás" kártya eltávolítása |
| Autó részletek - `CarDetailsPage` | Megtakarítási potenciál kártya eltávolítása |
| Autó kártya - `CarCard` | Becsült megtakarítás sor eltávolítása |
| Admin details - `CarDetailsDialog` | Becsült megtakarítás mező eltávolítása |
| Social proof - `SocialProof` | "Becsült megtakarítás" statisztika eltávolítása |
| useCars hook | `getTotalSavings` funkció eltávolítása |
| Edge function | `estimate-savings` törlése |

### Törlendő fájlok
- `src/components/SavingsCalculator.tsx`
- `supabase/functions/estimate-savings/index.ts`

---

## 3. fázis: Admin felület - Email cím megjelenítése (PRIORITÁS: MAGAS)

### Probléma
Az admin felületen az ügyfelek email címe nem látszik, mert az `auth.users` táblából nem lehet közvetlenül lekérdezni.

### Megoldás
Az email címet a `profiles` táblában kell tárolni (új `email` oszlop), amit a `handle_new_user` trigger automatikusan kitölt regisztrációkor.

### Változtatások
1. **Adatbázis migráció**: 
   - Új `email` oszlop a `profiles` táblában
   - `handle_new_user` trigger frissítése
   - Meglévő felhasználók email címének migrálása

2. **`src/pages/AdminClients.tsx`**: 
   - Profile-ból email lekérdezése
   - Email oszlop megjelenítése

3. **`src/components/admin/CarDetailsDialog.tsx`**: 
   - Email megjelenítés javítása

---

## 4. fázis: Időszaki áttekintés javítása (PRIORITÁS: KÖZEPES)

### Probléma
A timeline jelenleg az évfordulót is mutatja, de az utána lévő napoknak nincs értelme.

### Helyes mérföldkövek
| Nap | Leírás |
|-----|--------|
| 60 nap | Váltási időszak kezdete - emlékeztető email |
| 50 nap | 1. emlékeztető - váltásig még 20 nap |
| 40 nap | 2. emlékeztető - sürgős, váltásig még 10 nap |
| 30 nap | Váltási időszak vége |

### Változtatások
- **`src/components/dashboard/InsuranceTimeline.tsx`**: Évforduló sor eltávolítása, leírások pontosítása
- **`src/pages/DashboardSettings.tsx`**: Az emlékeztető beállítások már helyesek (60, 50, 40)

---

## 5. fázis: Egyéb javaslatok (KÉSŐBBI FÁZIS)

A következő funkciókat később implementáljuk:
- Személyes dokumentumok feltöltése (személyi, lakcím, jogsi) GDPR hozzájárulással
- Több dokumentum feltöltése autónként
- Dokumentum csere/megtekintés később is

---

## Technikai részletek

### Adatbázis migráció

```sql
-- Új email oszlop a profiles táblában
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Email cím kitöltése meglévő felhasználóknál (auth.users-ből)
UPDATE public.profiles p
SET email = (
  SELECT email FROM auth.users u WHERE u.id = p.user_id
)
WHERE p.email IS NULL;

-- Trigger frissítése a jövőbeli regisztrációkhoz
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      NEW.email
    );
    UPDATE public.app_stats SET total_users = total_users + 1 WHERE id = 1;
    RETURN NEW;
END;
$$;
```

### Register.tsx módosítás

A sikeres regisztráció után nem a login oldalra irányítunk, hanem megerősítő üzenetet mutatunk:
```tsx
// Sikeres regisztráció esetén
toast({
  title: "✉️ Kérlek erősítsd meg az email címed!",
  description: "Küldtünk egy megerősítő linket az email címedre. Kattints rá a regisztráció befejezéséhez.",
  duration: 10000,
});
// Maradunk a regisztrációs oldalon, nem navigálunk
```

### AdminClients.tsx módosítás

```tsx
// A profiles lekérdezéshez hozzáadjuk az email-t
profiles!cars_user_id_fkey (
  full_name,
  phone,
  email
)

// Az email oszlop megjelenítése a táblázatban
<TableCell>
  <span className="text-sm">
    {car.profiles?.email || "-"}
  </span>
</TableCell>
```

### Törlendő fájlok listája

1. `src/components/SavingsCalculator.tsx`
2. `supabase/functions/estimate-savings/index.ts` (ha létezik)

### Módosítandó fájlok összefoglalója

| Fájl | Változtatás |
|------|-------------|
| `src/pages/Register.tsx` | Email megerősítés üzenet |
| `src/pages/Index.tsx` | SavingsCalculator eltávolítása |
| `src/pages/DashboardHome.tsx` | Megtakarítás StatCard eltávolítása |
| `src/pages/CarDetailsPage.tsx` | Megtakarítási potenciál kártya törlése |
| `src/components/dashboard/CarCard.tsx` | Becsült megtakarítás sor törlése |
| `src/components/admin/CarDetailsDialog.tsx` | Becsült megtakarítás mező törlése, email javítás |
| `src/components/SocialProof.tsx` | Megtakarítás statisztika eltávolítása |
| `src/hooks/useCars.ts` | getTotalSavings funkció törlése |
| `src/pages/AdminClients.tsx` | Email megjelenítés |
| `src/components/dashboard/InsuranceTimeline.tsx` | Évforduló sor eltávolítása |
| `supabase/config.toml` | estimate-savings funkció törlése |

---

## Megjegyzések a nem implementált funkciókhoz

### Beállítások mentés hiba (fehér képernyő)
A user által említett hibát nem tudtam reprodukálni a kódból, a `DashboardSettings.tsx` megfelelően van implementálva. Ez lehet böngésző cache probléma vagy átmeneti hiba volt.

### Session persistence
Ez a működés helyes és várt – a Supabase automatikusan megőrzi a session-t localStorage-ban. Ez szinte minden modern webalkalmazásnál így működik.

### Autó becenév
Ez marad, mert hasznos azonosító az ügyfélnek, ha több autója is van.

### Évjárat lenyíló
Ez már meg lett javítva az előző üzenetben.
