import { GIFT_ANIMATION_CLASS, giftImage } from "./giftAssets";

interface GiftVisualProps {
  slug: string;
  name: string;
  emoji?: string | null;
  image_url?: string | null;
  animation?: string;
  size?: number;
  className?: string;
}

/**
 * Renders a gift as its custom illustration when one exists, otherwise falls
 * back to the catalog emoji glyph so the catalog can grow without new assets.
 */
export function GiftVisual({
  slug,
  name,
  emoji,
  image_url,
  animation,
  size = 64,
  className = "",
}: GiftVisualProps) {
  const src = giftImage(slug, image_url);
  const anim = GIFT_ANIMATION_CLASS[animation || "float"] || GIFT_ANIMATION_CLASS.float;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`object-contain ${anim} ${className}`}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.78), lineHeight: 1 }}
      className={`flex items-center justify-center select-none ${anim} ${className}`}
    >
      {emoji || "🎁"}
    </span>
  );
}
