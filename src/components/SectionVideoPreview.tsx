import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

interface Props {
  src: string;
  caption?: string;
  label: string;
  aspectRatio?: string;
  className?: string;
  /** Optional lightweight thumbnail shown before the video is loaded */
  poster?: string;
}

/**
 * Lightweight video preview:
 * - Renders ONLY a static thumbnail (poster image or gradient shell) with a play overlay.
 * - The <video> element is created and downloaded ONLY after the user clicks/taps.
 * This keeps the homepage payload tiny (no MB-sized video on first load).
 */
export function SectionVideoPreview({
  src,
  caption,
  label,
  aspectRatio = "16 / 9",
  className = "",
  poster,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activated, setActivated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!activated) return;
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, [activated, isReady]);

  return (
    <figure
      className={`my-8 mx-auto max-w-3xl rounded-2xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/10 bg-card ${className}`}
    >
      <div
        className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card to-accent/10"
        style={{ aspectRatio }}
      >
        {!activated ? (
          <button
            type="button"
            onClick={() => setActivated(true)}
            aria-label={`Play ${label}`}
            className="absolute inset-0 h-full w-full group"
          >
            {poster && (
              <img
                src={poster}
                alt={label}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform duration-200 group-hover:scale-110">
                <Play className="h-7 w-7 translate-x-[2px]" fill="currentColor" />
              </span>
            </span>
          </button>
        ) : (
          <>
            {!isReady && (
              <div className="absolute inset-0 animate-pulse bg-muted/40" aria-hidden="true" />
            )}
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              aria-label={label}
              onLoadedData={() => setIsReady(true)}
              onCanPlay={() => setIsReady(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                isReady ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
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
