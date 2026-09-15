import { useEffect } from "react";
import { GiftVisual } from "./GiftVisual";
import type { GiftBubbleData } from "./GiftBubble";

interface MegaGiftOverlayProps {
  gift: GiftBubbleData;
  senderName: string;
  onClose: () => void;
}

const SPARKLES = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 71) % 100}%`,
  top: `${(i * 37) % 100}%`,
  delay: `${(i % 7) * 0.22}s`,
  size: 6 + ((i * 5) % 10),
}));

/**
 * Full-screen takeover shown in chat when a Mega gift arrives — the big
 * premium moment, like the large animated gifts on live-streaming apps.
 */
export function MegaGiftOverlay({ gift, senderName, onClose }: MegaGiftOverlayProps) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 6000);
    return () => window.clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-label={`Mega gift ${gift.name}`}
    >
      {/* rotating light rays */}
      <div
        className="mega-gift-rays pointer-events-none absolute h-[150vmax] w-[150vmax] opacity-40"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, hsl(45 100% 60% / 0.35) 12deg, transparent 24deg, transparent 40deg, hsl(330 100% 65% / 0.3) 52deg, transparent 64deg, transparent 90deg, hsl(265 100% 70% / 0.3) 102deg, transparent 114deg, transparent 360deg)",
        }}
        aria-hidden
      />
      {/* sparkles */}
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="mega-gift-sparkle pointer-events-none absolute rounded-full bg-amber-300"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay }}
          aria-hidden
        />
      ))}

      <div className="relative flex flex-col items-center gap-4 px-6 text-center">
        <div className="mega-gift-enter">
          <GiftVisual
            slug={gift.slug}
            name={gift.name}
            image_url={gift.image_url}
            animation="mega"
            size={280}
            className="drop-shadow-2xl"
          />
        </div>
        <div className="mega-gift-enter" style={{ animationDelay: "0.25s" }}>
          <p className="text-3xl font-black tracking-tight text-amber-300 drop-shadow-lg sm:text-4xl">
            {gift.name}
          </p>
          <p className="mt-1 text-sm font-medium text-white/85">
            {senderName} sent a Mega gift · {gift.price_credits.toLocaleString()} credits
          </p>
        </div>
      </div>
    </div>
  );
}
