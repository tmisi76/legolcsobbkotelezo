

# Terv: WYSIWYG szerkeszto az email sablonokhoz

## Jelenlegi allapot
Az admin email sablon szerkeszto oldalon (`/admin/email-templates`) jelenleg egy nyers HTML szerkeszto (Textarea) van az elso fullon, es egy Elonezet iframe a masodikon. Az admin nem tud HTML-t irni, igy nem tudja erdemben szerkeszteni az emaileket.

## Valtozas

Az `AdminEmailTemplates.tsx` oldalon atrendezzuk a tabfuuleket:

1. **Alapertelmezett ful: "Szerkeszto"** - A mar meglevo TipTap-alapu `RichTextEditor` komponens kerul ide (WYSIWYG), amit a projekt mar hasznal az `AdminPages` oldalon is. Az admin itt vizualisan szerkesztheti a szoveget (felkover, dolt, alcimek, listak stb.)
2. **Masodik ful: "Elonezet"** - Megmarad az iframe-es elonezet, a placeholder-ek minta adatokkal kitoltve
3. **Harmadik ful: "HTML"** - A jelenlegi nyers HTML Textarea ide kerul, "haladoknak". Igy aki ert hozza, tovabbra is kozvetlenul szerkesztheti a HTML-t

A tab sorrend tehat: **Szerkeszto** (alapertelmezett) > **Elonezet** > **HTML**

## Technikai reszletek

### Erintett fajlok
- `src/pages/AdminEmailTemplates.tsx` - Tab struktura atrendezese, RichTextEditor import hozzaadasa

### Logika
- A `RichTextEditor` ugyanazt az `editBodies` state-et hasznalja mint a Textarea - igy barmelyik fulrol szerkeszt az admin, a valtozas szinkronban marad
- Az `onChange` callback frissiti az `editBodies[template.id]` erteket
- A `content` prop a `editBodies[template.id] ?? template.body_html` erteket kapja

### Tab struktura
```text
Tabs defaultValue="editor"    (jelenleg: "code")

  TabsTrigger "editor"  -> Szerkeszto (Edit3 ikon)     [UJ - alapertelmezett]
  TabsTrigger "preview" -> Elonezet   (Eye ikon)        [megmarad]
  TabsTrigger "code"    -> HTML       (Code ikon)        [hatra kerul]

  TabsContent "editor"  -> <RichTextEditor content={...} onChange={...} />
  TabsContent "preview" -> iframe (megmarad valtozas nelkul)
  TabsContent "code"    -> Textarea (megmarad valtozas nelkul)
```

Nincs uj fuggoseg, nincs adatbazis valtozas - a `RichTextEditor` es a TipTap csomagok mar telepitve vannak.
