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
import racing from "@/assets/section-videos/racing.mp4.asset.json";
import livestream from "@/assets/section-videos/livestream.mp4.asset.json";
import fashion from "@/assets/section-videos/fashion.mp4.asset.json";
import fitness from "@/assets/section-videos/fitness.mp4.asset.json";
import property from "@/assets/section-videos/property.mp4.asset.json";
import holographicAvatars from "@/assets/section-videos/holographic-avatars.mp4.asset.json";
import timeCapsule from "@/assets/section-videos/time-capsule.mp4.asset.json";
import kitchenStars from "@/assets/section-videos/kitchen-stars.mp4.asset.json";
import comedyClub from "@/assets/section-videos/comedy-club.mp4.asset.json";
import marketplace from "@/assets/section-videos/marketplace.mp4.asset.json";
import secretSanta from "@/assets/section-videos/secret-santa.mp4.asset.json";
import coupons from "@/assets/section-videos/coupons.mp4.asset.json";
import lieDetector from "@/assets/section-videos/lie-detector.mp4.asset.json";
import emotion from "@/assets/section-videos/emotion.mp4.asset.json";
import photoRestoration from "@/assets/section-videos/photo-restoration.mp4.asset.json";

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
  racing: racing.url,
  livestream: livestream.url,
  fashion: fashion.url,
  fitness: fitness.url,
  property: property.url,
  holographicAvatars: holographicAvatars.url,
  timeCapsule: timeCapsule.url,
  kitchenStars: kitchenStars.url,
  comedyClub: comedyClub.url,
  marketplace: marketplace.url,
  secretSanta: secretSanta.url,
  coupons: coupons.url,
  lieDetector: lieDetector.url,
  emotion: emotion.url,
  photoRestoration: photoRestoration.url,
} as const;

export type SectionVideoKey = keyof typeof sectionVideos;
