import { useEffect, useState } from "react";
import socialImg from "@/assets/hero-slide-social.jpg";
import aiImg from "@/assets/hero-slide-ai.jpg";
import marketplaceImg from "@/assets/hero-slide-marketplace.jpg";
import datingImg from "@/assets/hero-slide-dating.jpg";
import gamesImg from "@/assets/hero-slide-games.jpg";
import kidsImg from "@/assets/hero-slide-kids.jpg";
import jobsImg from "@/assets/hero-slide-jobs.jpg";
import fundraisingImg from "@/assets/hero-slide-fundraising.jpg";

/**
 * Crisp full-bleed slideshow for the home hero. Replaces the previous video
 * background — sharp on every device (no codec/blur artifacts), animates only
 * opacity + slow Ken Burns zoom for a cinematic feel.
 */
const SLIDES = [
  { src: socialImg, alt: "Social wall and live community" },
  { src: aiImg, alt: "AI tools and credits" },
  { src: marketplaceImg, alt: "Marketplace and bazaar" },
  { src: datingImg, alt: "Dating and matchmaking" },
  { src: gamesImg, alt: "Games and arenas" },
  { src: kidsImg, alt: "Kids Channel and Fairy Castles" },
  { src: jobsImg, alt: "Jobs and ProClass" },
  { src: fundraisingImg, alt: "Fundraising and creator economy" },
];

const INTERVAL_MS = 4500;

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-background">
      {SLIDES.map((slide, i) => {
        const active = i === index;
        return (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            width={1920}
            height={1080}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            {...({ fetchpriority: i === 0 ? "high" : "low" } as any)}
            className={[
              "absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none",
              "transition-opacity duration-[1400ms] ease-in-out will-change-[opacity,transform]",
              active ? "opacity-100 animate-hero-kenburns" : "opacity-0",
            ].join(" ")}
            style={{ objectPosition: "center center" }}
            draggable={false}
          />
        );
      })}

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={[
              "h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
