import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface CertificatePreviewHandle {
  /** Renders the certificate into a canvas (for PDF / image export). */
  capture: () => Promise<HTMLCanvasElement | null>;
}

/**
 * Renders AI-generated certificate HTML inside a sandboxed iframe so its global
 * CSS (html/body rules, fixed widths, resets) can never leak into the app layout.
 * The iframe is auto-scaled so the wide A4-landscape design fits any container.
 */
export const CertificatePreview = forwardRef<CertificatePreviewHandle, { html: string; designWidth?: number }>(
  function CertificatePreview({ html, designWidth = 1123 }, ref) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<HTMLIFrameElement>(null);
    const [scale, setScale] = useState(1);
    const [contentHeight, setContentHeight] = useState(794);

    const doc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=${designWidth}">
<style>
  html,body{margin:0;padding:0;background:#fff;}
  body{width:${designWidth}px;font-family:Georgia,'Times New Roman',serif;}
  img{max-width:100%;}
</style></head><body>${html}</body></html>`;

    // Fit width
    useEffect(() => {
      const fit = () => {
        const w = wrapRef.current?.clientWidth || designWidth;
        setScale(Math.min(1, w / designWidth));
      };
      fit();
      const wrap = wrapRef.current;
      if (!wrap) return;
      const ro = new ResizeObserver(fit);
      ro.observe(wrap);
      window.addEventListener("orientationchange", fit);
      return () => {
        ro.disconnect();
        window.removeEventListener("orientationchange", fit);
      };
    }, [designWidth]);

    const measureFrame = () => {
      const body = frameRef.current?.contentDocument?.body;
      if (!body) return;
      const h = Math.max(body.scrollHeight, 400);
      setContentHeight(h);
    };

    useImperativeHandle(ref, () => ({
      capture: async () => {
        const frameDoc = frameRef.current?.contentDocument;
        const target = frameDoc?.body;
        if (!target) return null;
        const { default: html2canvas } = await import("html2canvas");
        return html2canvas(target, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          width: designWidth,
          height: Math.max(target.scrollHeight, 400),
          windowWidth: designWidth,
        });
      },
    }));

    return (
      <div ref={wrapRef} className="w-full max-w-full overflow-hidden rounded-lg border shadow-lg bg-white">
        <div style={{ height: contentHeight * scale }} className="overflow-hidden">
          <iframe
            ref={frameRef}
            title="Certificate preview"
            srcDoc={doc}
            onLoad={() => {
              measureFrame();
              window.setTimeout(measureFrame, 300);
            }}
            scrolling="no"
            style={{
              width: designWidth,
              height: contentHeight,
              border: "none",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          />
        </div>
      </div>
    );
  }
);
