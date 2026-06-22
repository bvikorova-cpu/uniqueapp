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
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setLoad(true);
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure
      className={`my-8 mx-auto max-w-3xl rounded-2xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/10 bg-card ${className}`}
    >
      <video
        ref={ref}
        src={load ? src : undefined}
        poster={undefined}
        muted
        loop
        playsInline
        autoPlay
        preload="none"
        aria-label={label}
        className="w-full h-auto block"
        style={{ aspectRatio }}
      />
      {caption && (
        <figcaption className="px-4 py-2 text-xs text-muted-foreground text-center bg-muted/30">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default SectionVideoPreview;
