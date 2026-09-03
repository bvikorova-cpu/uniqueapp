import heroImage from "@/assets/home-hero.jpg";

/**
 * Full-bleed static hero image.
 *
 * Perf: replaces the previous ~11.8 MB autoplay video. A single JPEG (~180 kB)
 * keeps LCP fast on mobile, uses no CPU for decoding frames and costs no
 * extra bandwidth on metered connections.
 */
export function HeroSlideshow() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-background">
      <img
        src={heroImage}
        alt="Unique — abstract iridescent spiral"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
        style={{ filter: "brightness(1.02) saturate(1.1)" }}
      />
    </div>
  );
}

export default HeroSlideshow;
