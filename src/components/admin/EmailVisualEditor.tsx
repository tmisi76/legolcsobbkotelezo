import { useRef, useEffect, useCallback } from "react";

interface EmailVisualEditorProps {
  html: string;
  onChange: (html: string) => void;
}

export function EmailVisualEditor({ html, onChange }: EmailVisualEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isUpdatingRef = useRef(false);
  const lastInternalHtmlRef = useRef(html);
  const cleanupRef = useRef<(() => void) | undefined>();
  const onChangeRef = useRef(onChange);
  const initialHtmlRef = useRef(html);

  // Always keep onChangeRef fresh
  onChangeRef.current = onChange;

  const setupEditable = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc || !doc.body) return;

    doc.body.contentEditable = "true";
    doc.body.style.outline = "none";
    doc.body.style.cursor = "text";
    doc.body.style.fontFamily = "Arial, Helvetica, sans-serif";

    const emitChange = () => {
      if (isUpdatingRef.current) return;
      const newHtml = doc.body.innerHTML;
      lastInternalHtmlRef.current = newHtml;
      onChangeRef.current(newHtml);
    };

    doc.body.addEventListener("input", emitChange);

    const observer = new MutationObserver(() => {
      if (isUpdatingRef.current) return;
      const newHtml = doc.body.innerHTML;
      lastInternalHtmlRef.current = newHtml;
      onChangeRef.current(newHtml);
    });

    observer.observe(doc.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });

    cleanupRef.current = () => {
      doc.body.removeEventListener("input", emitChange);
      observer.disconnect();
    };
  }, []);

  // Only update iframe when html changes from an EXTERNAL source (e.g. HTML tab)
  useEffect(() => {
    if (html === lastInternalHtmlRef.current) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc || !doc.body) return;

    if (doc.body.innerHTML !== html) {
      isUpdatingRef.current = true;
      doc.body.innerHTML = html;
      lastInternalHtmlRef.current = html;
      isUpdatingRef.current = false;
    }
  }, [html]);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const handleLoad = () => {
    cleanupRef.current?.();
    setupEditable();
  };

  // srcDoc is built ONLY from initialHtmlRef — never changes between renders
  const srcDoc = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;">${initialHtmlRef.current}</body>
</html>`;

  return (
    <div className="border rounded-lg overflow-hidden bg-muted/30">
      <iframe
        ref={iframeRef}
        srcDoc={srcDoc}
        onLoad={handleLoad}
        className="w-full h-[600px] bg-white"
        title="Email szerkesztő"
        sandbox="allow-same-origin"
      />
    </div>
  );
}
