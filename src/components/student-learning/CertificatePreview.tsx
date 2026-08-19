import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Renders certificate HTML (designed for a wide, A4-landscape-ish canvas) scaled
 * down to fit any container — no horizontal cut-off on mobile.
 *
 * The generated HTML often carries its own fixed widths (e.g. 1123px for A4
 * landscape) that are larger than our assumed design width, which previously
 * caused the certificate to be cropped. We therefore MEASURE the real content
 * width at scale 1 and derive the scale from that measurement.
 */
export function CertificatePreview({ html, designWidth = 900 }: { html: string; designWidth?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    // Measure at natural size (scale 1) so scrollWidth/Height are untransformed.
    inner.style.transform = "none";
    inner.style.width = "max-content";
    const contentWidth = Math.max(inner.scrollWidth, designWidth, 1);
    const contentHeight = inner.scrollHeight;

    const available = wrap.clientWidth || contentWidth;
    const next = Math.min(1, available / contentWidth);

    inner.style.width = `${contentWidth}px`;
    inner.style.transform = `scale(${next})`;

    setScale(next);
    setHeight(contentHeight * next);
  }, [designWidth]);

  useLayoutEffect(() => {
    measure();
    // Re-measure after webfonts/images inside the certificate settle.
    const t = window.setTimeout(measure, 300);
    return () => window.clearTimeout(t);
  }, [html, measure]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(wrap);
    window.addEventListener("orientationchange", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", measure);
    };
  }, [measure]);

  return (
    <div ref={wrapRef} className="w-full max-w-full overflow-hidden rounded-lg border shadow-lg bg-white">
      <div style={{ height }} className="overflow-hidden">
        <div
          ref={innerRef}
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
