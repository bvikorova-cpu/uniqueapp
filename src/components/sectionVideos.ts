/**
 * Central registry of section preview videos.
 * Add new entries here as you generate more.
 */
import hero from "@/assets/section-videos/hero.mp4.asset.json";
import megatalent from "@/assets/section-videos/megatalent.mp4.asset.json";
import music from "@/assets/section-videos/music.mp4.asset.json";
import dating from "@/assets/section-videos/dating.mp4.asset.json";
import bazaar from "@/assets/section-videos/bazaar.mp4.asset.json";

export const sectionVideos = {
  hero: hero.url,
  megatalent: megatalent.url,
  music: music.url,
  dating: dating.url,
  bazaar: bazaar.url,
} as const;

export type SectionVideoKey = keyof typeof sectionVideos;
