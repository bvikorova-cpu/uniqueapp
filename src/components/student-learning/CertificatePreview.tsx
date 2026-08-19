import { useEffect, useRef, useState } from "react";

/**
 * Renders certificate HTML (designed for a fixed A4-ish width) scaled down
 * to fit any container — no horizontal cut-off on mobile.
 */
export function CertificatePreview({ html, designWidth = 900 }: { html: string; designWidth?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const update = () => {
      const available = wrap.clientWidth;
      const next = Math.min(1, available / designWidth);
      setScale(next);
      setHeight(inner.scrollHeight * next);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [html, designWidth]);

  return (
    <div ref={wrapRef} className="w-full overflow-hidden rounded-lg border shadow-lg bg-white">
      <div style={{ height }}>
        <div
          ref={innerRef}
          style={{ width: designWidth, transform: `scale(${scale})`, transformOrigin: "top left" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
