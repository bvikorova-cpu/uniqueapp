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
 * Autoplay-loop muted 5s section preview video.
 * Lazy-loads via IntersectionObserver (no LCP impact, no data waste).
 * Drop between text blocks: <p>...</p> <SectionVideoPreview .../> <p>...</p>
 */
export function SectionVideoPreview({
  src,
  caption,
  label,
  aspectRatio = "16 / 9",
  className = "",
}: Props) {
  const figureRef = useRef<HTMLElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const target = figureRef.current;
    if (!target) return;

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          loadObserver.disconnect();
        }
      },
      { rootMargin: "1200px 0px", threshold: 0.01 },
    );

    loadObserver.observe(target);
    return () => loadObserver.disconnect();
  }, []);

  useEffect(() => {
    const target = figureRef.current;
    if (!target) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const visible = entry.isIntersecting;
        setIsVisible(visible);

        const el = ref.current;
        if (!el) return;
        if (visible && shouldLoad) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    const el = ref.current;
    if (shouldLoad && el) el.load();
  }, [shouldLoad, src]);

  return (
    <figure
      ref={figureRef}
      className={`my-8 mx-auto max-w-3xl rounded-2xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/10 bg-card ${className}`}
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card to-accent/10" style={{ aspectRatio }}>
        {!isReady && <div className="absolute inset-0 animate-pulse bg-muted/40" aria-hidden="true" />}
        <video
          ref={ref}
          src={shouldLoad ? src : undefined}
          poster={undefined}
          muted
          loop
          playsInline
          autoPlay={isVisible}
          preload={shouldLoad ? "auto" : "none"}
          aria-label={label}
          onCanPlay={() => {
            setIsReady(true);
            if (isVisible) ref.current?.play().catch(() => {});
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-0"}`}
        />
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
