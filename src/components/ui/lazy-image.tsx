import { ImgHTMLAttributes, useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** When true, eagerly load (use for above-the-fold/LCP images). */
  priority?: boolean;
  /** Aspect ratio CSS value (e.g. "16/9", "1/1") to reserve layout space and prevent CLS. */
  aspectRatio?: string;
  /** Show a soft skeleton until the image loads. */
  skeleton?: boolean;
  /** Fallback image URL on error. */
  fallbackSrc?: string;
}

/**
 * Drop-in replacement for <img> with sensible defaults:
 * - loading="lazy" + decoding="async" by default
 * - fetchPriority="high" when priority
 * - Reserves space via aspectRatio to prevent layout shift
 * - Soft skeleton + graceful error fallback
 */
export const LazyImage = forwardRef<HTMLImageElement, LazyImageProps>(
  (
    {
      priority = false,
      aspectRatio,
      skeleton = true,
      fallbackSrc,
      className,
      style,
      onLoad,
      onError,
      alt = "",
      ...rest
    },
    ref,
  ) => {
    const [loaded, setLoaded] = useState(false);
    const [errored, setErrored] = useState(false);

    return (
      <span
        className={cn(
          "relative inline-block overflow-hidden",
          skeleton && !loaded && "bg-muted/40 animate-pulse",
          className,
        )}
        style={aspectRatio ? { aspectRatio, ...style } : style}
      >
        <img
          ref={ref}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          // @ts-expect-error - fetchpriority is valid HTML, types lag
          fetchpriority={priority ? "high" : "auto"}
          onLoad={(e) => {
            setLoaded(true);
            onLoad?.(e);
          }}
          onError={(e) => {
            setErrored(true);
            if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
              e.currentTarget.src = fallbackSrc;
            }
            onError?.(e);
          }}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
          {...rest}
        />
      </span>
    );
  },
);

LazyImage.displayName = "LazyImage";

export default LazyImage;
