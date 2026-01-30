
# Terv: Évjárat lenyíló és szövegjavítás

## Összefoglaló
Az évjárat mezőt lenyíló menüvé alakítjuk (aktuális évtől 70 évig visszafelé), és javítjuk az email értesítés kérdés szövegét.

## Változtatások

### 1. Évjárat mező átalakítása Select komponensre
- Jelenlegi: `<Input type="number">` mező
- Új: `<Select>` lenyíló menü
- Opciók: 2026, 2025, 2024, ... 1956 (aktuális év - 70 év)
- Az aktuális év lesz az alapértelmezett

### 2. Szövegjavítás
- Jelenlegi: "Elfogadnád, hogy a biztosító emailben értesítsen..."
- Új: "Elfogadod, hogy a biztosító emailben értesítsen..."

---

## Technikai részletek

### Érintett fájl
| Fájl | Művelet |
|------|---------|
| `src/components/dashboard/CarFormModal.tsx` | Szerkesztés |

### Szükséges import bővítés
Hozzá kell adni a Select komponenseket:
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
```

### Évjárat generátor logika
```tsx
const currentYear = new Date().getFullYear();
const yearOptions = Array.from(
  { length: 71 }, 
  (_, i) => currentYear - i
);
// Eredmény: [2026, 2025, 2024, ..., 1956]
```

### Évjárat mező új struktúra (407-425. sor)
Az Input mező helyett:
```tsx
<FormField
  control={form.control}
  name="year"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Évjárat *</FormLabel>
      <Select
        onValueChange={(value) => field.onChange(parseInt(value))}
        value={field.value?.toString()}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Válaszd ki az évjáratot" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {yearOptions.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Szövegjavítás (642. sor)
```tsx
// Előtte:
<FormLabel>Elfogadnád, hogy a biztosító emailben értesítsen (ne küldjön postai levelet)? *</FormLabel>

// Utána:
<FormLabel>Elfogadod, hogy a biztosító emailben értesítsen (ne küldjön postai levelet)? *</FormLabel>
```

## Előnyök
- Könnyebb évjárat kiválasztás mobilon is
- Nincs lehetőség hibás évszám bevitelére
- Egységes igealak a kérdésekben
