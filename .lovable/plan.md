
# Fix: Font egyeztetese a szerkeszto es az elonezet kozott

## Problema
Az `EmailVisualEditor` iframe-jenek `body` elemerol hianyzik a `font-family` stilus. A bongeszo ilyenkor az alapertelmezett serif fontot hasznalja a `contenteditable` modban, mig az email sablonok sajat inline stilusai (pl. `Arial, sans-serif`) az elonetzetben helyesen jelennek meg.

## Megoldas
Az `EmailVisualEditor.tsx` fajlban ket helyen kell modositani:

1. **`srcDoc` generalas** (77-81. sor): A `body` style-hoz hozzaadjuk a `font-family: Arial, Helvetica, sans-serif` erteket, ami az email sablonokban hasznalt alap font.

2. **`setupEditable` fuggveny** (20-22. sor): A `contentEditable` beallitasa utan expliciten rarakjuk a `font-family`-t is a body-ra, hogy ne vesszen el a `contenteditable` aktivalasakor.

## Technikai reszletek

### Erintett fajl
- `src/components/admin/EmailVisualEditor.tsx`

### Valtozasok

**srcDoc** (80. sor):
```
// Jelenleg:
<body style="margin:0;padding:0;">

// Utana:
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;">
```

**setupEditable** (22. sor utan):
```typescript
doc.body.style.fontFamily = "Arial, Helvetica, sans-serif";
```

Igy a szerkeszto iframe-ben ugyanaz a font jelenik meg, mint az elonetzetben, fuggetlenul attol, hogy a `contenteditable` attributum aktiv-e vagy sem.
