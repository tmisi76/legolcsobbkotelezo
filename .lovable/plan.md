

# Terv: Fiók törlés funkció implementálása

## Összefoglaló
A felhasználók képesek lesznek teljesen törölni a fiókjukat, beleértve minden autót, dokumentumot és személyes adatot.

---

## Műszaki megvalósítás

### 1. Új Edge Function: `delete-account`

Létrehozunk egy új Edge Function-t, ami:
1. Ellenőrzi a felhasználó jelszavát
2. Törli az összes kapcsolódó adatot a táblákból
3. Törli a felhasználót az `auth.users` táblából

```
supabase/functions/delete-account/index.ts
```

**Működés:**
- A felhasználó elküldi a jelszavát
- Az Edge Function ellenőrzi a jelszót (`signInWithPassword`)
- Ha helyes, a `service_role` kulccsal törli:
  - `car_documents` (az autókon keresztül)
  - `personal_documents`
  - `reminder_logs` (az autókon keresztül)
  - `cars`
  - `profiles`
  - `user_roles`
  - `auth.users` (a felhasználó maga)

### 2. Frontend módosítás: `DashboardSettings.tsx`

A `handleDeleteAccount` függvényt frissítjük:
- Meghívja az Edge Function-t
- Sikeres törlés esetén kijelentkezteti a felhasználót
- Átirányít a főoldalra

---

## Törlési sorrend (fontos a foreign key-ek miatt)

```text
1. car_documents (car_id referencia)
2. reminder_logs (car_id referencia)
3. personal_documents (user_id referencia)
4. cars (user_id referencia)
5. user_roles (user_id referencia)
6. profiles (user_id referencia)
7. auth.users (a felhasználó maga)
```

---

## Biztonsági szempontok

- Jelszó megerősítés kötelező
- Csak a saját fiókot lehet törölni (JWT ellenőrzés)
- A törlés visszavonhatatlan
- Service role kulcs csak a szerveren használt

---

## Módosítandó fájlok

| Fájl | Változtatás |
|------|-------------|
| `supabase/functions/delete-account/index.ts` | Új Edge Function létrehozása |
| `supabase/config.toml` | JWT verifikáció kikapcsolása |
| `src/pages/DashboardSettings.tsx` | Edge Function hívás implementálása |

---

## Eredmény

A felhasználó:
1. Beírja a jelszavát a törlés megerősítéséhez
2. Az összes adata véglegesen törlődik
3. Kijelentkezik és a főoldalra kerül

