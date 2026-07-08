import { useEffect, useState } from "react";
import heroVideo from "@/assets/home-hero.mp4.asset.json";

/**
 * Full-bleed cinematic video hero.
 *
 * Perf notes (mobile):
 * - The source video is ~11.8 MB. `preload="auto"` on the initial paint would
 *   compete with JS/font requests and push LCP well past 2.5s on 4G.
 * - We render only the gradient background on first paint (the surrounding
 *   `Index` hero already draws a purple→pink gradient behind us), then mount
 *   the <video> AFTER first paint and switch to `preload="metadata"` so the
 *   browser only fetches the moov atom and starts streaming on play, not
 *   the whole file up-front.
 * - `saveData` or 2G/slow-2g users never load the video at all.
 */
export function HeroSlideshow() {
  const [mount, setMount] = useState(false);

  useEffect(() => {
    // Respect Data-Saver / slow networks.
    const nav = navigator as any;
    if (nav?.connection?.saveData) return;
    const et = nav?.connection?.effectiveType as string | undefined;
    if (et === "2g" || et === "slow-2g") return;

    // Defer mount until after first paint so LCP measures the gradient,
    // not the 11 MB video download.
    const w = window as any;
    const schedule = w.requestIdleCallback
      ? (cb: () => void) => w.requestIdleCallback(cb, { timeout: 1200 })
      : (cb: () => void) => setTimeout(cb, 400);
    const id = schedule(() => setMount(true));
    return () => {
      if (w.cancelIdleCallback && typeof id === "number") w.cancelIdleCallback(id);
      else clearTimeout(id as any);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-background">
      {mount && (
        <video
          src={heroVideo.url}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
          style={{ filter: "brightness(1.02) saturate(1.1)" }}
        />
      )}
    </div>
  );
}

export default HeroSlideshow;
