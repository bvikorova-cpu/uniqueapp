import { GiftVisual } from "./GiftVisual";

export interface GiftBubbleData {
  slug: string;
  name: string;
  price_credits: number;
  rarity: string;
  animation: string;
  image_url: string | null;
  emoji?: string | null;
}

interface GiftBubbleProps {
  gift: GiftBubbleData;
  compact?: boolean;
}

export function GiftBubble({ gift, compact = false }: GiftBubbleProps) {
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
        <GiftVisual
          slug={gift.slug}
          name={gift.name}
          emoji={gift.emoji}
          image_url={gift.image_url}
          animation={gift.animation}
          size={size}
          className="relative drop-shadow-lg"
        />
      </div>
      <span className="text-xs font-semibold">{gift.name}</span>
      <span className="text-[10px] opacity-70">{gift.price_credits} credits</span>
    </div>
  );
}
