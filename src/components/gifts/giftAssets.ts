import rose from "@/assets/gifts/rose.png";
import heart from "@/assets/gifts/heart.png";
import star from "@/assets/gifts/star.png";
import coffee from "@/assets/gifts/coffee.png";
import cake from "@/assets/gifts/cake.png";
import teddy from "@/assets/gifts/teddy.png";
import balloons from "@/assets/gifts/balloons.png";
import disco from "@/assets/gifts/disco.png";
import guitar from "@/assets/gifts/guitar.png";
import fireworks from "@/assets/gifts/fireworks.png";
import unicorn from "@/assets/gifts/unicorn.png";
import dragon from "@/assets/gifts/dragon.png";
import castle from "@/assets/gifts/castle.png";
import phoenix from "@/assets/gifts/phoenix.png";
import lion from "@/assets/gifts/lion.png";
import diamond from "@/assets/gifts/diamond.png";
import crown from "@/assets/gifts/crown.png";
import treasure from "@/assets/gifts/treasure.png";
import sportscar from "@/assets/gifts/sportscar.png";
import jet from "@/assets/gifts/jet.png";

export const GIFT_IMAGES: Record<string, string> = {
  rose,
  heart,
  star,
  coffee,
  cake,
  teddy,
  balloons,
  disco,
  guitar,
  fireworks,
  unicorn,
  dragon,
  castle,
  phoenix,
  lion,
  diamond,
  crown,
  treasure,
  sportscar,
  jet,
};

export const GIFT_CATEGORIES = [
  { id: "classic", label: "Classic" },
  { id: "love", label: "Love" },
  { id: "party", label: "Music & Party" },
  { id: "fairytale", label: "Fairytale" },
  { id: "luxury", label: "Luxury" },
  { id: "nature", label: "Nature" },
  { id: "food", label: "Food" },
  { id: "adventure", label: "Adventure" },
  { id: "cosmic", label: "Cosmic" },
  { id: "cute", label: "Cute" },
] as const;

export const GIFT_ANIMATION_CLASS: Record<string, string> = {
  float: "gift-anim-float",
  pulse: "gift-anim-pulse",
  spin: "gift-anim-spin",
  bounce: "gift-anim-bounce",
  swing: "gift-anim-swing",
  glow: "gift-anim-glow",
  burst: "gift-anim-burst",
};

export const GIFT_RARITY_RING: Record<string, string> = {
  common: "ring-border",
  rare: "ring-primary/50",
  epic: "ring-accent/60",
  legendary: "ring-amber-400/70",
};

export const giftImage = (slug: string, fallback?: string | null) =>
  GIFT_IMAGES[slug] || fallback || "";
