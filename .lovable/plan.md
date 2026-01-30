

# Terv: Többszörös dokumentumfeltöltés az autó űrlapon

## Összefoglaló
A CarFormModal step 3-ban több dokumentum feltöltésének engedélyezése, automatikus feltöltéssel és egyszerűsített gombokkal.

---

## Jelenlegi működés

- A CarFormModal step 3-ban **csak 1 fájl** választható ki
- A fájl lokálisan tárolódik (`selectedFile` state), és csak a "Hozzáadás" gombra kattintva töltődik fel
- A gomb szövege: "Hozzáadás"
- Van "Kihagyom" gomb is

---

## Új működés

1. **Több fájl kiválasztása**: `multiple` attribútum a file input-on
2. **Automatikus feltöltés**: Kiválasztás után azonnal feltöltődik a storage-ba és bekerül a `car_documents` táblába
3. **Feltöltött fájlok listája**: A feltöltött fájlok megjelennek listában, egyenként törölhetők
4. **Gomb szöveg**: "Hozzáadás" → "Tovább"
5. **Egyszerűsített gombok**: "Vissza" és "Tovább" (nincs "Kihagyom" - ha nem tölt fel semmit, üres marad)

---

## Technikai megvalósítás

### 1. CarFormModal.tsx változások

**State változások:**
```tsx
// Régi:
const [selectedFile, setSelectedFile] = useState<File | null>(null);

// Új:
const [uploadedFiles, setUploadedFiles] = useState<Array<{id: string, name: string, path: string}>>([]);
const [isFileUploading, setIsFileUploading] = useState(false);
```

**Fájlfeltöltés logika:**
```tsx
const handleFileSelect = async (files: FileList) => {
  if (!savedCarId) return; // Az autó már mentve kell legyen
  
  setIsFileUploading(true);
  for (const file of Array.from(files)) {
    // Validálás
    const error = validateFile(file);
    if (error) {
      toast.error(`${file.name}: ${error}`);
      continue;
    }
    
    // Feltöltés storage-ba
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${savedCarId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('insurance-documents')
      .upload(filePath, file);
    
    if (uploadError) {
      toast.error(`${file.name}: Feltöltési hiba`);
      continue;
    }
    
    // Mentés car_documents táblába
    const { data, error: dbError } = await supabase
      .from('car_documents')
      .insert({
        car_id: savedCarId,
        file_path: filePath,
        file_name: file.name,
        file_type: file.type,
      })
      .select()
      .single();
    
    if (!dbError && data) {
      setUploadedFiles(prev => [...prev, { id: data.id, name: file.name, path: filePath }]);
      toast.success(`${file.name} feltöltve`);
    }
  }
  setIsFileUploading(false);
};
```

### 2. Workflow változás

**Probléma**: Jelenleg az autó mentése a "Hozzáadás" gombra történik, de a dokumentumok feltöltéséhez már kell a `car_id`.

**Megoldás**: Két lépcsős mentés
1. Step 2 végén az autó adatait mentjük (kapunk `car_id`-t)
2. Step 3-ban a dokumentumok feltöltése közvetlenül a storage-ba és `car_documents` táblába történik
3. "Tovább" gomb bezárja a modalt

```tsx
// handleNext módosítása step 2-nél
else if (step === 2) {
  const step2Fields = [...];
  const isValid = await form.trigger(step2Fields);
  if (isValid) {
    // Autó mentése itt
    await saveCarData();
    setStep(3);
  }
}
```

### 3. Gomb szekció (step 3)

```tsx
{step === 3 && (
  <>
    <Button
      type="button"
      variant="outline"
      onClick={handleBack}
      disabled={isFileUploading}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Vissza
    </Button>
    <Button 
      type="button" 
      className="flex-1" 
      onClick={handleFinish}
      disabled={isFileUploading}
    >
      {isFileUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      Tovább
    </Button>
  </>
)}
```

### 4. Fájl lista megjelenítés

```tsx
{/* Feltöltött fájlok listája */}
{uploadedFiles.length > 0 && (
  <div className="space-y-2 mt-4">
    {uploadedFiles.map((file) => (
      <div key={file.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-sm truncate">{file.name}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => handleRemoveUploadedFile(file)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    ))}
  </div>
)}
```

---

## Módosítandó fájlok

| Fájl | Változtatás |
|------|-------------|
| `src/components/dashboard/CarFormModal.tsx` | Többszörös feltöltés, auto-upload, UI változások |
| `src/pages/DashboardCars.tsx` | handleFormSubmit egyszerűsítése (doksi feltöltés már nem itt) |

---

## UX folyamat

1. Felhasználó kitölti step 1-et (autó adatok) → "Tovább"
2. Felhasználó kitölti step 2-t (biztosítási preferenciák) → "Tovább" → **Autó mentése történik**
3. Step 3: Dokumentum feltöltés terület
   - Fájl kiválasztása → automatikus feltöltés → megjelenik a listában
   - Több fájl is feltölthető (egyesével vagy egyszerre)
   - Feltöltött fájlok törölhetők
4. "Tovább" gomb → Modal bezárul, siker üzenet

---

## Előnyök

- **Jobb UX**: Azonnali visszajelzés a feltöltésről
- **Több dokumentum**: Forgalmi, kötvény, díjértesítő stb.
- **Rugalmasság**: Egyesével vagy egyszerre is feltölthető
- **Biztonság**: Fájlok közvetlenül a `car_documents` táblába kerülnek, nem a `cars.document_url`-ba

