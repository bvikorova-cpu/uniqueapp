import { useEffect, useState } from "react";
import { Check, Coins, Wallet } from "lucide-react";
import { GiftVisual } from "./GiftVisual";
import type { CatalogGift } from "./GiftShopSheet";

interface CreditFlowOverlayProps {
  gift: Pick<CatalogGift, "slug" | "name" | "animation" | "image_url" | "emoji" | "price_credits">;
  recipientName?: string;
  balanceAfter?: number | null;
  onDone: () => void;
}

const COINS = Array.from({ length: 9 }, (_, i) => ({
  delay: i * 0.09,
  dx: 120 + ((i * 23) % 46),
  dy: -150 - ((i * 31) % 70),
  drift: (i % 3) - 1,
}));

/**
 * Shows the full purchase flow: credits leaving the wallet as flying coins,
 * then the gift lighting up and a delivery receipt.
 */
export function CreditFlowOverlay({
  gift,
  recipientName,
  balanceAfter,
  onDone,
}: CreditFlowOverlayProps) {
  const [phase, setPhase] = useState<"pay" | "delivered">("pay");

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("delivered"), 1250);
    const t2 = window.setTimeout(onDone, 3200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-background/85 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      onClick={onDone}
    >
      <div className="relative flex flex-col items-center gap-6 px-6 text-center">
        {/* gift target */}
        <div className="relative">
          {phase === "delivered" && (
            <span
              className="credit-ring-out absolute inset-0 rounded-full border-2 border-primary/50"
              aria-hidden
            />
          )}
          <div className={phase === "delivered" ? "credit-gift-pop" : ""}>
            <GiftVisual
              slug={gift.slug}
              name={gift.name}
              emoji={gift.emoji}
              image_url={gift.image_url}
              animation={gift.animation}
              size={160}
              className="drop-shadow-xl"
            />
          </div>
        </div>

        {phase === "pay" ? (
          <p className="text-sm font-medium text-muted-foreground">
            Paying {gift.price_credits.toLocaleString()} credits…
          </p>
        ) : (
          <div className="credit-receipt-in flex flex-col items-center gap-2">
            <span className="flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
              <Check className="h-4 w-4" />
              {recipientName ? `${recipientName} received it` : "Gift received"}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Coins className="h-3.5 w-3.5" />
              −{gift.price_credits.toLocaleString()} credits
              {balanceAfter !== null && balanceAfter !== undefined
                ? ` · balance ${balanceAfter.toLocaleString()}`
                : ""}
            </span>
          </div>
        )}

        {/* wallet + flying coins */}
        <div className="relative mt-2">
          <span className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium">
            <Wallet className="h-3.5 w-3.5 text-primary" />
            Credit wallet
          </span>
          {phase === "pay" &&
            COINS.map((c, i) => (
              <span
                key={i}
                className="credit-coin-fly pointer-events-none absolute left-1/2 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-amber-900 shadow-lg"
                style={
                  {
                    animationDelay: `${c.delay}s`,
                    ["--coin-dx" as string]: `${c.drift * 24}px`,
                    ["--coin-dy" as string]: `${c.dy}px`,
                  } as React.CSSProperties
                }
                aria-hidden
              >
                €
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
