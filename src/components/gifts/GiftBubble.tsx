import { GIFT_ANIMATION_CLASS, giftImage } from "./giftAssets";

export interface GiftBubbleData {
  slug: string;
  name: string;
  price_credits: number;
  rarity: string;
  animation: string;
  image_url: string | null;
}

interface GiftBubbleProps {
  gift: GiftBubbleData;
  compact?: boolean;
}

export function GiftBubble({ gift, compact = false }: GiftBubbleProps) {
  const src = giftImage(gift.slug, gift.image_url);
  const anim = GIFT_ANIMATION_CLASS[gift.animation] || GIFT_ANIMATION_CLASS.float;
  const size = compact ? 56 : 112;

  return (
    <div className="flex flex-col items-center gap-1 py-1">
      <div className="relative">
        {gift.rarity === "legendary" && (
          <span className="absolute inset-0 rounded-full bg-amber-400/25 blur-xl" aria-hidden />
        )}
        {gift.rarity === "epic" && (
          <span className="absolute inset-0 rounded-full bg-accent/20 blur-xl" aria-hidden />
        )}
        <img
          src={src}
          alt={gift.name}
          loading="lazy"
          width={size}
          height={size}
          style={{ width: size, height: size }}
          className={`relative object-contain drop-shadow-lg ${anim}`}
        />
      </div>
      <span className="text-xs font-semibold">{gift.name}</span>
      <span className="text-[10px] opacity-70">{gift.price_credits} credits</span>
    </div>
  );
}
