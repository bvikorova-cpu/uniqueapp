import { lazy, Suspense, useEffect, useRef, useState, type ComponentType } from "react";

/**
 * Mounts a lazily-imported component only after its placeholder scrolls
 * near the viewport (or after browser idle time). Cuts initial JS parse
 * on the landing route where below-the-fold content is expensive
 * (framer-motion spotlight, video preview registry, etc.).
 */
export function LazyOnVisible<P extends object>({
  loader,
  rootMargin = "600px 0px",
  fallback = null,
  ...rest
}: {
  loader: () => Promise<{ default: ComponentType<P> }>;
  rootMargin?: string;
  fallback?: React.ReactNode;
} & P) {
  const [visible, setVisible] = useState(false);
  const [Comp, setComp] = useState<ComponentType<P> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);

    // Fallback: mount after idle so slow scrollers still get content.
    const idle = (window as any).requestIdleCallback
      ? (window as any).requestIdleCallback(() => setVisible(true), { timeout: 4000 })
      : window.setTimeout(() => setVisible(true), 3000);

    return () => {
      io.disconnect();
      if ((window as any).cancelIdleCallback) (window as any).cancelIdleCallback(idle);
      else clearTimeout(idle as number);
    };
  }, [visible, rootMargin]);

  useEffect(() => {
    if (!visible || Comp) return;
    let cancelled = false;
    loader().then(m => { if (!cancelled) setComp(() => m.default); });
    return () => { cancelled = true; };
  }, [visible, Comp, loader]);

  return (
    <div ref={ref} style={{ minHeight: visible ? undefined : 400 }}>
      {Comp ? <Suspense fallback={fallback}><Comp {...(rest as any)} /></Suspense> : fallback}
    </div>
  );
}

export default LazyOnVisible;
