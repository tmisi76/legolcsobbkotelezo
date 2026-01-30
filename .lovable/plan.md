

# Terv: Autó frissítése után az oldal frissítése

## Probléma

A `CarFormModal` komponens közvetlenül a Supabase klienst használja a mentéshez (a `saveCarData` függvényben), nem a `useCars` hook mutációit. Emiatt a React Query cache nem frissül automatikusan, és a felhasználó nem látja az új adatokat.

---

## Megoldás

A `CarFormModal` komponensben a sikeres mentés után manuálisan invalidáljuk a React Query cache-t.

### Változtatások

**Fájl:** `src/components/dashboard/CarFormModal.tsx`

1. Importáljuk a `useQueryClient` hookot a `@tanstack/react-query` csomagból
2. A komponensben létrehozzuk a `queryClient` példányt
3. Sikeres mentés után invalidáljuk a "cars" query-t

```tsx
// Import hozzáadása
import { useQueryClient } from "@tanstack/react-query";

// A komponensen belül
const queryClient = useQueryClient();

// A saveCarData függvényben, sikeres mentés után:
queryClient.invalidateQueries({ queryKey: ["cars", user.id] });
```

---

## Módosítandó fájl

| Fájl | Változtatás |
|------|-------------|
| `src/components/dashboard/CarFormModal.tsx` | Cache invalidálás hozzáadása sikeres mentés után |

---

## Eredmény

Az autó frissítése után az adatok automatikusan újratöltődnek, és a felhasználó azonnal látja a legfrissebb információkat.

