

# Terv: Kalkulátor lecserélése tájékoztató szövegre

## Összefoglaló
A jelenlegi "Mennyit spórolhatsz évente?" kalkulátor konkrét, véletlenszerűen generált százalékokkal számol (15-20%), ami félrevezető lehet és potenciálisan MNB bírságot vonhat maga után. A kalkulátort egy informatív, de nem konkrét ígéreteket tartalmazó szekciókra cseréljük.

## Változtatások

### 1. SavingsCalculator komponens átalakítása
A teljes interaktív kalkulátort lecseréljük egy statikus, de vizuálisan vonzó információs blokkra:

**Új tartalom:**
- **Főcím:** "💰 Mennyit spórolhatsz?"
- **Fő üzenet:** "Évente akár több tízezer forintot is! Ez nagyban függ attól, hogy kihasználtunk-e minden rendelkezésünkre álló kedvezményt."
- **Kiegészítő pontok (opcionális):**
  - Bonus-malus besorolás figyelembevétele
  - Díjkedvezmények összehasonlítása
  - Egyedi igények felmérése

### 2. Eltávolítandó elemek
- Slider komponens
- Input mező
- Véletlenszerű százalék generálás
- Konkrét forint összegek megjelenítése
- Confetti animáció
- 5 éves megtakarítás számítás

### 3. Megtartandó elemek
- Szekció struktúra és elhelyezés
- Gradient keret design
- "Regisztrálj az ingyenes emlékeztetőért!" CTA gomb
- Framer Motion animációk (fade-in)

## Technikai részletek

### Érintett fájlok
| Fájl | Művelet |
|------|---------|
| `src/components/SavingsCalculator.tsx` | Teljes átírás |

### Eltávolítandó importok
- `Slider` komponens
- `Input` komponens
- `useCountUp` hook
- `useState` (részben)

### Új komponens struktúra
```text
┌─────────────────────────────────────────┐
│ 💰 Mennyit spórolhatsz?                │
├─────────────────────────────────────────┤
│                                         │
│   Évente akár több tízezer forintot    │
│                  is!                    │
│                                         │
│   Ez nagyban függ attól, hogy          │
│   kihasználtunk-e minden               │
│   rendelkezésünkre álló kedvezményt.   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Regisztrálj az ingyenes         │   │
│  │ emlékeztetőért!            →    │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Előnyök
- MNB-konform, nem tartalmaz félrevezető számításokat
- Megtartja a marketing üzenetet anélkül, hogy konkrét ígéreteket tenne
- Egyszerűbb, kevesebb kód
- Továbbra is ösztönzi a regisztrációt

