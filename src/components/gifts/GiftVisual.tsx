import { GIFT_ANIMATION_CLASS, giftImage } from "./giftAssets";

interface GiftVisualProps {
  slug: string;
  name: string;
  /** @deprecated kept for call-site compatibility; emoji glyphs are never rendered. */
  emoji?: string | null;
  image_url?: string | null;
  animation?: string;
  size?: number;
  className?: string;
}

/**
 * Renders a gift as its custom 3D illustration. Every gift resolves to an
 * image (with a universal 3D fallback), so emoji glyphs are never used.
 */
export function GiftVisual({
  slug,
  name,
  image_url,
  animation,
  size = 64,
  className = "",
}: GiftVisualProps) {
  const src = giftImage(slug, image_url);
  const anim = GIFT_ANIMATION_CLASS[animation || "float"] || GIFT_ANIMATION_CLASS.float;

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
