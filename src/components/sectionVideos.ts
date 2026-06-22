/**
 * Central registry of section preview videos.
 * Add new entries here as you generate more.
 */
import hero from "@/assets/section-videos/hero.mp4.asset.json";
import megatalent from "@/assets/section-videos/megatalent.mp4.asset.json";
import music from "@/assets/section-videos/music.mp4.asset.json";
import dating from "@/assets/section-videos/dating.mp4.asset.json";
import bazaar from "@/assets/section-videos/bazaar.mp4.asset.json";
import kids from "@/assets/section-videos/kids.mp4.asset.json";
import education from "@/assets/section-videos/education.mp4.asset.json";
import beauty from "@/assets/section-videos/beauty.mp4.asset.json";
import jobs from "@/assets/section-videos/jobs.mp4.asset.json";
import aiTools from "@/assets/section-videos/ai-tools.mp4.asset.json";

export const sectionVideos = {
  hero: hero.url,
  megatalent: megatalent.url,
  music: music.url,
  dating: dating.url,
  bazaar: bazaar.url,
  kids: kids.url,
  education: education.url,
  beauty: beauty.url,
  jobs: jobs.url,
  aiTools: aiTools.url,
} as const;

export type SectionVideoKey = keyof typeof sectionVideos;
