/**
 * Static poster thumbnails (first frame) for the section preview videos.
 * Used so the homepage loads ~15 KB images instead of multi-MB videos.
 */
import heroPoster from "@/assets/section-posters/hero.webp.asset.json";
import datingPoster from "@/assets/section-posters/dating.webp.asset.json";
import bazaarPoster from "@/assets/section-posters/bazaar.webp.asset.json";
import beautyPoster from "@/assets/section-posters/beauty.webp.asset.json";
import aiToolsPoster from "@/assets/section-posters/ai-tools.webp.asset.json";
import jobsPoster from "@/assets/section-posters/jobs.webp.asset.json";
import educationPoster from "@/assets/section-posters/education.webp.asset.json";
import kidsPoster from "@/assets/section-posters/kids.webp.asset.json";
import livestreamPoster from "@/assets/section-posters/livestream.webp.asset.json";
import fashionPoster from "@/assets/section-posters/fashion.webp.asset.json";
import fitnessPoster from "@/assets/section-posters/fitness.webp.asset.json";
import propertyPoster from "@/assets/section-posters/property.webp.asset.json";
import holographicAvatarsPoster from "@/assets/section-posters/holographic-avatars.webp.asset.json";
import timeCapsulePoster from "@/assets/section-posters/time-capsule.webp.asset.json";
import kitchenStarsPoster from "@/assets/section-posters/kitchen-stars.webp.asset.json";
import comedyClubPoster from "@/assets/section-posters/comedy-club.webp.asset.json";
import marketplacePoster from "@/assets/section-posters/marketplace.webp.asset.json";
import secretSantaPoster from "@/assets/section-posters/secret-santa.webp.asset.json";
import couponsPoster from "@/assets/section-posters/coupons.webp.asset.json";
import lieDetectorPoster from "@/assets/section-posters/lie-detector.webp.asset.json";
import emotionPoster from "@/assets/section-posters/emotion.webp.asset.json";
import photoRestorationPoster from "@/assets/section-posters/photo-restoration.webp.asset.json";
import virtualPetPoster from "@/assets/section-posters/virtual-pet.webp.asset.json";
import influKingPoster from "@/assets/section-posters/influ-king.webp.asset.json";

export const sectionPosters = {
  hero: heroPoster.url,
  dating: datingPoster.url,
  bazaar: bazaarPoster.url,
  beauty: beautyPoster.url,
  aiTools: aiToolsPoster.url,
  jobs: jobsPoster.url,
  education: educationPoster.url,
  kids: kidsPoster.url,
  livestream: livestreamPoster.url,
  fashion: fashionPoster.url,
  fitness: fitnessPoster.url,
  property: propertyPoster.url,
  holographicAvatars: holographicAvatarsPoster.url,
  timeCapsule: timeCapsulePoster.url,
  kitchenStars: kitchenStarsPoster.url,
  comedyClub: comedyClubPoster.url,
  marketplace: marketplacePoster.url,
  secretSanta: secretSantaPoster.url,
  coupons: couponsPoster.url,
  lieDetector: lieDetectorPoster.url,
  emotion: emotionPoster.url,
  photoRestoration: photoRestorationPoster.url,
  virtualPet: virtualPetPoster.url,
  influKing: influKingPoster.url,
} as const;

export default sectionPosters;
