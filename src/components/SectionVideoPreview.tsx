import { useEffect, useRef, useState } from "react";

interface Props {
  /** CDN URL of the .mp4 (from .asset.json) */
  src: string;
  /** Short caption shown above the video */
  caption?: string;
  /** Aria label for the video (a11y) */
  label: string;
  /** Aspect ratio. Default 16/9 */
  aspectRatio?: string;
  className?: string;
}

/**
 * Global registry of mounted previews. Only the preview closest to the
 * viewport centre is allowed to download/play — the rest stay as a
 * lightweight gradient placeholder. This keeps total network usage under
 * ~8 MB regardless of how many previews are on the page (we had 27).
 */
const registry = new Set<{
  el: HTMLElement;
  activate: (on: boolean) => void;
}>();

let rafScheduled = false;
function scheduleArbitration() {
  if (rafScheduled) return;
  rafScheduled = true;
  requestAnimationFrame(() => {
    rafScheduled = false;
    const vh = window.innerHeight;
    const centre = vh / 2;
    let best: { entry: typeof registry extends Set<infer T> ? T : never; dist: number } | null = null;
    registry.forEach((entry) => {
      const r = entry.el.getBoundingClientRect();
      // ignore far-offscreen previews
      if (r.bottom < -vh || r.top > vh * 2) return;
      const mid = r.top + r.height / 2;
      const dist = Math.abs(mid - centre);
      // require at least partial visibility within 1 viewport
      if (r.bottom < 0 || r.top > vh) return;
      if (!best || dist < best.dist) best = { entry, dist };
    });
    registry.forEach((entry) => entry.activate(entry === best?.entry));
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("scroll", scheduleArbitration, { passive: true });
  window.addEventListener("resize", scheduleArbitration);
}

export function SectionVideoPreview({
  src,
  caption,
  label,
  aspectRatio = "16 / 9",
  className = "",
}: Props) {
  const figureRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const el = figureRef.current;
    if (!el) return;
    const entry = {
      el,
      activate: (on: boolean) => {
        setActive((prev) => {
          if (prev === on) return prev;
          if (!on) setIsReady(false);
          return on;
        });
      },
    };
    registry.add(entry);
    scheduleArbitration();
    return () => {
      registry.delete(entry);
      scheduleArbitration();
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      v.load();
      v.play().catch(() => {});
    } else {
      v.pause();
      v.removeAttribute("src");
      v.load();
    }
  }, [active, src]);

  return (
    <figure
      ref={figureRef}
      className={`my-8 mx-auto max-w-3xl rounded-2xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/10 bg-card ${className}`}
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card to-accent/10" style={{ aspectRatio }}>
        {!isReady && <div className="absolute inset-0 animate-pulse bg-muted/40" aria-hidden="true" />}
        {active && (
          <video
            ref={videoRef}
            src={src}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            aria-label={label}
            onCanPlay={() => {
              setIsReady(true);
              videoRef.current?.play().catch(() => {});
            }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-0"}`}
          />
        )}
      </div>
      {caption && (
        <figcaption className="px-4 py-2 text-xs text-muted-foreground text-center bg-muted/30">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default SectionVideoPreview;
