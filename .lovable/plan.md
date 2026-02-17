

# Footer ragadjon a bongeszo aljara

## Problema
A footer kozvetlenul a tartalom utan jelenik meg, ahelyett hogy a bongeszo ablak aljan lenne. Ha a tartalom rovid, a footer "felcsuszk" es ugy nez ki, mintha lebegne az oldal kozepen.

## Megoldas
A `DashboardLayout` fo tartalomteruleteben (`<main>`) a tartalmat es a footert ugy kell elrendezni, hogy a footer mindig a bongeszo ablak aljara keruljon. Ehhez a `<main>` elem `min-h-screen` lesz, flexbox elrendezesben, es a tartalom resz `flex-1`-gyel kitolti a maradek helyet.

## Technikai reszletek

**Erintett fajl:** `src/components/dashboard/DashboardLayout.tsx`

A `<main>` elemen belul:
- A `<main>`-re `min-h-screen flex flex-col` kerul
- A tartalom `<div>` (a `p-4 md:p-6` resz) kap egy `flex-1` osztalt, hogy kitoltse a rendelkezesre allo helyet
- A `<DashboardFooter />` igy automatikusan az aljara kerul

Valtozas:
```
// main elem:
// Jelenlegi: className="transition-all duration-300 pt-14 md:pt-0 ..."
// Uj: className="transition-all duration-300 pt-14 md:pt-0 min-h-screen flex flex-col ..."

// Tartalom div:
// Jelenlegi: className="p-4 md:p-6 pb-20 md:pb-6"
// Uj: className="p-4 md:p-6 pb-20 md:pb-6 flex-1"
```

Ez egy egyszeru CSS-valtozas, ket osztaly hozzaadasa ket elemhez.
