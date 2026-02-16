

# Javitas: Email szerkeszto - ujratoltesi ciklus megszuntetese

## Problema
A jelenlegi `EmailVisualEditor` komponensben a `srcDoc` prop minden React renderkor ujraszamitodik, mert kozvetlenul a `html` prop-bol epul. Amikor a felhasznalo beir egy betut:

1. Az iframe `input` esemenye meghivja `onChange(newHtml)`
2. A szulo komponens frissiti az `editBodies` state-et
3. React ujrarendereli az `EmailVisualEditor`-t uj `html` prop-pal
4. A `srcDoc` ujraszamitodik -> **az iframe teljesen ujratoltodik**
5. A kurzor es a fokusz elveszik

A `lastInternalHtmlRef` megoldas nem segit, mert a `srcDoc` valtozasa az iframe teljes ujratoltesehez vezet -- ez nem `innerHTML` csere, hanem egy uj dokumentum betoltese.

## Megoldas

Az iframe `srcDoc`-jat **csak egyszer** allitjuk be, az elso renderkor. Utana minden valtozast `doc.body.innerHTML`-en keresztul kezelunk. Ezt ugy erjuk el, hogy a `srcDoc` erteket egy `useRef`-ben taroljuk, es soha nem frissitjuk.

### Erintett fajl
- `src/components/admin/EmailVisualEditor.tsx`

### Konkret valtozasok

1. **Uj ref az initial HTML-nek**: `initialHtmlRef = useRef(html)` -- ez csak egyszer kap erteket, a komponens mountolasakor
2. **srcDoc csak az initialHtmlRef-bol epul**: Igy az iframe soha nem toltodik ujra a szerkesztes soran
3. **A `setupEditable` es az external update useEffect valtozatlan marad** -- az external update (HTML fulrol) tovabbra is `doc.body.innerHTML`-t allitja
4. **Az `onChange` callback-et `useRef`-ben taroljuk**, hogy a `setupEditable` `useCallback` ne fuggjon tole, igy a MutationObserver sem lesz ujra-beallitva renderkor

### Uj kod vazlat

```typescript
export function EmailVisualEditor({ html, onChange }: EmailVisualEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isUpdatingRef = useRef(false);
  const lastInternalHtmlRef = useRef(html);
  const cleanupRef = useRef<(() => void) | undefined>();
  const onChangeRef = useRef(onChange);
  const initialHtmlRef = useRef(html);  // csak egyszer

  // onChange mindig friss
  onChangeRef.current = onChange;

  const setupEditable = useCallback(() => {
    // ... contentEditable beallitas ...

    const emitChange = () => {
      if (isUpdatingRef.current) return;
      const newHtml = doc.body.innerHTML;
      lastInternalHtmlRef.current = newHtml;
      onChangeRef.current(newHtml);  // ref-en keresztul, nincs fuggoseg
    };

    // ... listener + observer beallitas ...
  }, []);  // ures fuggoseg tomb!

  // External update useEffect -- valtozatlan
  useEffect(() => {
    if (html === lastInternalHtmlRef.current) return;
    // ... doc.body.innerHTML = html ...
  }, [html]);

  // srcDoc CSAK az initial HTML-bol epul, soha nem valtozik
  const srcDoc = `<!DOCTYPE html>
<html>
<head>...</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;">
  ${initialHtmlRef.current}
</body>
</html>`;

  return <iframe ref={iframeRef} srcDoc={srcDoc} onLoad={handleLoad} ... />;
}
```

### Miert mukodik ez
- Az iframe `srcDoc`-ja soha nem valtozik renderek kozott -> nincs ujratoltes
- A gepeles soran az `onChange` csak a state-et frissiti, a React rendereles nem erinti az iframe-et
- Kulso valtozas (HTML ful) tovabbra is mukodik az `useEffect`-en keresztul, ami `doc.body.innerHTML`-t allitja
- A `useCallback` ures fuggoseggel es `onChangeRef` hasznalataval a MutationObserver nem all le/ujra minden renderkor

