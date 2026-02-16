

# Terv: Pixelpontos szerkesztheto email sablon + visszaallitas gomb

## Problema
A jelenlegi TipTap WYSIWYG szerkeszto nem kepes megjelenhteni a komplex email HTML-t (tablazatok, inline stilusok, szines hatterek stb.) - sima szoveget mutat a szep email helyett. Az Elonezet fulnel viszont latszik az eredeti email.

## Megoldas

### 1. "Szerkeszto" ful: contenteditable iframe
A TipTap `RichTextEditor`-t lecsereljuk egy **contenteditable iframe**-re. Ez ugy mukodik, mint az Elonezet, de a szovegek kozvetlenul szerkeszthetoek benne.

- Az iframe `srcDoc`-ja a nyers HTML sablon (placeholder-ekkel egyutt, nem cserelje ki oket mint az elonetzetnel)
- Az iframe-en belul a `body` elem `contenteditable="true"` attributumot kap
- Amikor a felhasznalo szerkeszt barmit, az iframe-bol kiolvasott HTML visszakerul az `editBodies` state-be
- Igy az admin **pontosan azt latja amit szerkeszt** - pixelpontos megjelenes

Technikai megvalosittas: egy uj komponens (`EmailVisualEditor`) ami:
- Egy iframe-et renderel
- Az iframe betoltese utan (`onLoad`) beallitja a `contenteditable`-t a body-n
- `MutationObserver`-rel vagy `input` esemennyel figyeli a valtozasokat
- A valtozaskor az iframe `body.innerHTML`-t visszairja az `onChange` callback-be

### 2. "Visszaallitas eredeti allapotra" gomb
Minden sablonhoz egy uj gomb a Mentes es Teljes elonezet melle:
- Ikon: `RotateCcw` (lucide)
- Szoveg: "Visszaallitas"
- Megnyomas elott megerosito dialog (`AlertDialog`): "Biztosan visszaallitod az eredeti sablont? A mostani modositasok elvesznek."
- Mukodes: torli az `editSubjects[id]` es `editBodies[id]` ertekeket (visszaall a DB-ben tarolt verzio)
- Ha az admin mar mentett egy modositast es az eredeti gyari sablonra akar visszaallni, az egy masik tema - egyelore a "mentes elotti allapot" visszaallitasa a cel

### Erintett fajlok
- **Uj:** `src/components/admin/EmailVisualEditor.tsx` - contenteditable iframe komponens
- **Modositas:** `src/pages/AdminEmailTemplates.tsx` - RichTextEditor csere EmailVisualEditor-ra, visszaallitas gomb hozzaadasa

### Tab struktura (valtozatlan sorrend)
```text
Szerkeszto (alapertelmezett) -> EmailVisualEditor (contenteditable iframe)
Elonezet                     -> iframe mintaadatokkal (valtozatlan)
HTML                         -> Textarea (valtozatlan)
```

### EmailVisualEditor komponens vazlat
```text
Props:
  - html: string (a nyers sablon HTML)
  - onChange: (html: string) => void

Mukodes:
  1. iframe rendereles srcDoc-kal
  2. onLoad: iframe.contentDocument.body.contentEditable = "true"
  3. iframe.contentDocument.body.addEventListener("input", ...) -> onChange(body.innerHTML)
  4. Ha a html prop valtozik kulsoleg (pl. HTML fulrol), ujratoltjuk az iframe-et
```

