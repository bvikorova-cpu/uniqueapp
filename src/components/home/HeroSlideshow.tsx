import heroVideo from "@/assets/home-hero.mp4.asset.json";

/**
 * Full-bleed cinematic video hero. Replaces the previous multi-image
 * slideshow with a single premium looping video for a cleaner, more
 * "wow" feel on mobile (matches the polished Challenges-style heroes).
 */
export function HeroSlideshow() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-background">
      <video
        src={heroVideo.url}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
        style={{ filter: "brightness(1.02) saturate(1.1)" }}
      />
    </div>
  );
}

export default HeroSlideshow;
