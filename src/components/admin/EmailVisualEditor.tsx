import { useRef, useEffect, useCallback } from "react";

interface EmailVisualEditorProps {
  html: string;
  onChange: (html: string) => void;
}

export function EmailVisualEditor({ html, onChange }: EmailVisualEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isUpdatingRef = useRef(false);
  const lastExternalHtmlRef = useRef(html);

  const setupEditable = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc || !doc.body) return;

    doc.body.contentEditable = "true";
    doc.body.style.outline = "none";
    doc.body.style.cursor = "text";
    doc.body.style.fontFamily = "Arial, Helvetica, sans-serif";

    // Listen for input changes
    const handleInput = () => {
      if (isUpdatingRef.current) return;
      const newHtml = doc.body.innerHTML;
      onChange(newHtml);
    };

    doc.body.addEventListener("input", handleInput);

    // Also use MutationObserver for changes that don't fire input events
    const observer = new MutationObserver(() => {
      if (isUpdatingRef.current) return;
      const newHtml = doc.body.innerHTML;
      onChange(newHtml);
    });

    observer.observe(doc.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });

    return () => {
      doc.body.removeEventListener("input", handleInput);
      observer.disconnect();
    };
  }, [onChange]);

  // Update iframe content when html prop changes externally (e.g. from HTML tab)
  useEffect(() => {
    if (html === lastExternalHtmlRef.current) return;
    lastExternalHtmlRef.current = html;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc || !doc.body) return;

    // Only update if content actually differs from what's in the iframe
    if (doc.body.innerHTML !== html) {
      isUpdatingRef.current = true;
      doc.body.innerHTML = html;
      isUpdatingRef.current = false;
    }
  }, [html]);

  const handleLoad = () => {
    setupEditable();
  };

  // Build a full HTML document so styles render correctly
  const srcDoc = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;">${html}</body>
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
