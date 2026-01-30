

# Terv: Email cím megjelenítése a név és telefonszám között

## Összefoglaló
A Tulajdonos oszlopban az email cím a név és a telefonszám **között** fog megjelenni, és az Email oszlop törlődik.

---

## Jelenlegi állapot
- **Tulajdonos oszlop**: név, telefonszám (alatta)
- **Email oszlop**: külön oszlopban

## Új elrendezés
A Tulajdonos oszlopban:
1. **Név** (félkövér)
2. **Email cím** (kisebb betűméret, szürke)
3. **Telefonszám** (kisebb betűméret, szürke)

---

## Változtatások

### 1. Tulajdonos cella módosítása (442-452. sor)

```tsx
<TableCell>
  <div className="flex flex-col">
    <span className="font-medium">
      {car.profiles?.full_name || "N/A"}
    </span>
    {car.user_email && (
      <span className="text-xs text-muted-foreground">
        {car.user_email}
      </span>
    )}
    {car.profiles?.phone && (
      <span className="text-xs text-muted-foreground">
        {car.profiles.phone}
      </span>
    )}
  </div>
</TableCell>
```

### 2. Email oszlop törlése

**Fejléc törlése** (404. sor):
```tsx
// Törlendő:
<TableHead>Email</TableHead>
```

**Cella törlése** (454-458. sor):
```tsx
// Törlendő:
<TableCell>
  <span className="text-sm text-muted-foreground">
    {car.user_email || "-"}
  </span>
</TableCell>
```

---

## Módosítandó fájl

| Fájl | Változtatás |
|------|-------------|
| `src/pages/AdminClients.tsx` | Tulajdonos oszlopban email a név és telefon közé, Email oszlop törlése |

---

## Eredmény

A Tulajdonos oszlopban a sorrend:
1. **Teszt József** (név - félkövér)
2. tesztjozsef@email.com (email - kisebb, szürke)
3. +36309373789 (telefon - kisebb, szürke)

Így minden fontos kapcsolatfelvételi adat egy oszlopban látható, a táblázat kompaktabb lesz.

