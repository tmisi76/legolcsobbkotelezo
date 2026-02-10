
# Terv: Admin blokk vizualis elvalasztasa a menuben

## Jelenlegi helyzet
Az admin menupontok (Potencialis szerzodok, Jogosultsagok, Tartalom) egyszeruen hozza vannak fuzve a normal menupontok listajahoz, vizualisan nem kulonulnek el. Az admin menupontok mar most is csak admin felhasznaloknak jelennek meg (`isAdmin` flag).

## Valtozas

Egyetlen fajl modosul: `src/components/dashboard/DashboardLayout.tsx`

A jelenlegi egyszemelyes `navItems.map()` ciklus helyett ketszakaszos megjelenitest csinalunk:

1. **Normal menupontok** - Attekintes, Autoim, Dokumentumaim, Beallitasok (mindenki latja)
2. **Admin blokk** - Csak adminoknak latszik, vizualisan elvalasztva:
   - Elvalaszto vonal (separator)
   - "Adminisztracio" cimke (label) a szekcio felett (csak nem osszecsukott allapotban), Shield ikonnal
   - Az admin menupontok kisse eltero stilussal (pl. az aktiv allapot narancssarga/warning szinu a kek/primary helyett)

Ez mindharom helyen megvalosul:
- **Desktop sidebar** - separator + label + admin linkek
- **Mobil slide-out menu** - separator + label + admin linkek
- **Mobil also navigacio** - csak a normal 4 menupont jelenik meg (az admin menupontok nem fernek el az also savban, azok csak a slide-out menubol erheto el)

## Technikai reszletek

A rendereles logikaja:

```text
baseNavItems.map(...)        <-- mindig megjelenik

{isAdmin && (
  <separator />
  <label: "Adminisztracio" />   <-- csak ha nincs osszecsukva
  adminNavItems.map(...)
)}
```

Az admin menupontok aktiv allapota `bg-orange-600` szinu lesz a `bg-primary` helyett, hogy vizualisan is megkulonboztetheto legyen.

Nincs adatbazis modositas, nincs uj fajl - csak a DashboardLayout.tsx strukturalis atrendezese.
