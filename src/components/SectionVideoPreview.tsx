import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  caption?: string;
  label: string;
  aspectRatio?: string;
  className?: string;
}

/**
 * Simple, reliable video preview:
 * - Loads video when within 800px of viewport (IntersectionObserver)
 * - preload="auto" so browser fetches eagerly once mounted
 * - Plays muted/looped when visible, pauses when not (no src removal — keeps cache)
 */
export function SectionVideoPreview({
  src,
  caption,
  label,
  aspectRatio = "16 / 9",
  className = "",
}: Props) {
  const figureRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Mount video once it's near viewport
  useEffect(() => {
    const el = figureRef.current;
    if (!el) return;
    if (shouldLoad) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shouldLoad]);

  // Track visibility for play/pause
  useEffect(() => {
    const el = figureRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setIsVisible(entries[0]?.isIntersecting ?? false),
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isVisible) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isVisible, isReady]);

  return (
    <figure
      ref={figureRef}
      className={`my-8 mx-auto max-w-3xl rounded-2xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/10 bg-card ${className}`}
    >
      <div
        className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card to-accent/10"
        style={{ aspectRatio }}
      >
        {!isReady && (
          <div className="absolute inset-0 animate-pulse bg-muted/40" aria-hidden="true" />
        )}
        {shouldLoad && (
          <video
            ref={videoRef}
            src={src}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            aria-label={label}
            onCanPlay={() => setIsReady(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              isReady ? "opacity-100" : "opacity-0"
            }`}
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
