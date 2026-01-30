
# Terv: Dokumentumkezelés bővítése, személyes dokumentumok és admin rendezés

## Összefoglaló
A kérések alapján három fő fejlesztési területet azonosítottam:
1. Több dokumentum feltöltése autónként (cserélhetőség és megtekintés)
2. Személyes dokumentumok fül (személyi, lakcím, jogsi) GDPR hozzájárulással
3. Admin oldalon rendezés évforduló alapján

---

## 1. fázis: Több dokumentum feltöltése autónként

### Jelenlegi állapot
- Jelenleg csak 1 dokumentum tölthető fel autónként (`document_url` oszlop a `cars` táblában)
- Az autó mentése után nem lehet dokumentumot cserélni vagy újat feltölteni
- Nincs lehetőség a feltöltött dokumentumok megtekintésére

### Megoldás
Új `car_documents` tábla létrehozása az autó-dokumentumok kezelésére:

| Oszlop | Típus | Leírás |
|--------|-------|--------|
| id | uuid | Elsődleges kulcs |
| car_id | uuid | Hivatkozás az autóra |
| file_path | text | Storage elérési út |
| file_name | text | Eredeti fájlnév |
| file_type | text | MIME típus |
| uploaded_at | timestamp | Feltöltés ideje |

### Érintett komponensek

**Új komponensek:**
- `src/components/dashboard/DocumentManager.tsx` - Dokumentumok listázása, feltöltése, törlése

**Módosítandó komponensek:**
- `CarFormModal.tsx` - Többszörös fájl feltöltés (step 3)
- `CarDetailsPage.tsx` - Dokumentum szekció bővítése (lista + feltöltés gomb)
- `CarDetailsDialog.tsx` (admin) - Több dokumentum megjelenítése

---

## 2. fázis: Személyes dokumentumok fül

### Új funkció
Felhasználók feltölthetik személyes irataikat (személyi, lakcím, jogosítvány) opcionálisan, GDPR hozzájárulással.

### Adatbázis
Új `personal_documents` tábla:

| Oszlop | Típus | Leírás |
|--------|-------|--------|
| id | uuid | Elsődleges kulcs |
| user_id | uuid | Hivatkozás a felhasználóra |
| document_type | enum | personal_id, address_card, drivers_license |
| file_path | text | Storage elérési út |
| file_name | text | Eredeti fájlnév |
| gdpr_consent_at | timestamp | GDPR hozzájárulás időpontja |
| uploaded_at | timestamp | Feltöltés időpontja |

### GDPR hozzájárulás
A feltöltés előtt kötelező checkbox:
> "Hozzájárulok, hogy a H-Kontakt Group Kft. a feltöltött személyes dokumentumaimat a biztosítási ügyintézés céljából kezelje. A hozzájárulást bármikor visszavonhatom."

### Új oldalak és komponensek
- `src/pages/DashboardDocuments.tsx` - Személyes dokumentumok oldal
- Navigáció bővítése a `DashboardLayout.tsx`-ben

### Storage
Új privát bucket: `personal-documents`
- RLS: csak a tulajdonos és adminok férhetnek hozzá

---

## 3. fázis: Admin rendezés évforduló alapján

### Jelenlegi állapot
Az admin oldal már rendezi az autókat évforduló szerint (ascending), DE nincs lehetőség a rendezés irányának megváltoztatására.

### Megoldás
Rendezés irány váltó gomb hozzáadása a táblázat fejlécéhez:

| Elem | Funkció |
|------|---------|
| Rendezés ikon | Évforduló oszlopnál kattintható |
| Állapotjelző | Felfelé/lefelé nyíl az aktuális irány jelzésére |

### Érintett fájl
- `AdminClients.tsx` - Rendezés state és logika

---

## Technikai részletek

### Adatbázis migráció

```sql
-- Autó dokumentumok tábla
CREATE TABLE public.car_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.car_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own car documents"
  ON public.car_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cars WHERE cars.id = car_documents.car_id AND cars.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert documents for their own cars"
  ON public.car_documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cars WHERE cars.id = car_documents.car_id AND cars.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own car documents"
  ON public.car_documents FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cars WHERE cars.id = car_documents.car_id AND cars.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all car documents"
  ON public.car_documents FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Személyes dokumentumok tábla
CREATE TYPE document_type AS ENUM ('personal_id', 'address_card', 'drivers_license');

CREATE TABLE public.personal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  gdpr_consent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, document_type)
);

ALTER TABLE public.personal_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own personal documents"
  ON public.personal_documents FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all personal documents"
  ON public.personal_documents FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
```

### Storage bucket

```sql
-- Személyes dokumentumok bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('personal-documents', 'personal-documents', false);

-- Storage RLS (insurance-documents már létezik)
CREATE POLICY "Users can manage their own personal docs"
  ON storage.objects FOR ALL
  USING (bucket_id = 'personal-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all personal docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'personal-documents' AND has_role(auth.uid(), 'admin'::app_role));
```

### Új navigációs elem (DashboardLayout.tsx)

```tsx
const baseNavItems = [
  { path: "/dashboard", label: "Áttekintés", icon: Home },
  { path: "/dashboard/cars", label: "Autóim", icon: Car },
  { path: "/dashboard/documents", label: "Dokumentumaim", icon: FileText }, // ÚJ
  { path: "/dashboard/settings", label: "Beállítások", icon: Settings },
];
```

### CarDetailsPage dokumentum szekció

```tsx
// Új szekció a meglévő megjegyzések mellett
<div className="bg-card rounded-xl border border-border p-5">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <FileText className="w-5 h-5 text-primary" />
      <h3 className="font-semibold text-foreground">Dokumentumok</h3>
    </div>
    <Button variant="outline" size="sm" onClick={() => setIsDocUploadOpen(true)}>
      <Upload className="w-4 h-4 mr-2" />
      Feltöltés
    </Button>
  </div>
  <DocumentList carId={car.id} />
</div>
```

### Admin rendezés (AdminClients.tsx)

```tsx
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

// A lekérdezésben
.order("anniversary_date", { ascending: sortDirection === 'asc' })

// Táblázat fejléc
<TableHead 
  className="cursor-pointer hover:bg-muted"
  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
>
  <div className="flex items-center gap-1">
    Évforduló
    {sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
  </div>
</TableHead>
```

---

## Módosítandó/létrehozandó fájlok összefoglalója

| Fájl | Művelet |
|------|---------|
| `src/pages/DashboardDocuments.tsx` | Létrehozás |
| `src/components/dashboard/DocumentManager.tsx` | Létrehozás |
| `src/components/dashboard/DocumentList.tsx` | Létrehozás |
| `src/components/dashboard/DashboardLayout.tsx` | Módosítás (nav) |
| `src/components/dashboard/CarFormModal.tsx` | Módosítás (multi upload) |
| `src/pages/CarDetailsPage.tsx` | Módosítás (dokumentum szekció) |
| `src/pages/AdminClients.tsx` | Módosítás (rendezés) |
| `src/components/admin/CarDetailsDialog.tsx` | Módosítás (több doksi) |
| `src/App.tsx` | Módosítás (új route) |
| `src/types/database.ts` | Módosítás (új típusok) |

---

## Megvalósítási sorrend

1. Adatbázis migráció (táblák + storage bucket)
2. Típusdefiníciók frissítése
3. DocumentManager és DocumentList komponensek
4. CarFormModal többszörös feltöltés
5. CarDetailsPage dokumentum szekció
6. DashboardDocuments oldal (személyes dokumentumok)
7. Admin oldal rendezés
8. Admin dialógban több dokumentum megjelenítése

