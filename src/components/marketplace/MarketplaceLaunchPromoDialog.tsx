import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Flame, Loader2, Rocket, Check } from "lucide-react";

export const MKT_LAUNCH_PROMO_CREDITS = 10;
export const MKT_LAUNCH_PROMO_REGULAR_CREDITS = 45;
export const MKT_LAUNCH_PROMO_DAYS = 30;

export type MarketplaceLaunchPromoKind = "bazaar" | "auction" | "coupon" | "course";

/**
 * Isolated launch-promo upsell shown right before a new marketplace item
 * (Bazaar listing, auction, coupon, course) goes live. Self-contained: no
 * existing component or style is modified.
 */
export function MarketplaceLaunchPromoDialog({
  open,
  onOpenChange,
  itemLabel = "listing",
  balance,
  busy,
  publishNote,
  onPublishWithPromo,
  onPublishWithoutPromo,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  itemLabel?: string;
  balance: number | null;
  busy: boolean;
  publishNote?: string;
  onPublishWithPromo: () => void;
  onPublishWithoutPromo: () => void;
}) {
  const [choice, setChoice] = useState<"promo" | "plain">("promo");
  const notEnough = balance !== null && balance < MKT_LAUNCH_PROMO_CREDITS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mkt-promo-dialog max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" /> One last step — boost your new {itemLabel}?
          </DialogTitle>
          <DialogDescription>
            Publishing is free (you just watch one short sponsored ad). Before it goes live you can
            activate a one-time launch boost so buyers see you first.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setChoice("promo")}
            className={`mkt-promo-option w-full rounded-xl border p-4 text-left transition ${
              choice === "promo" ? "border-primary bg-primary/5 ring-1 ring-primary/40" : "border-border"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <Flame className="h-4 w-4 text-primary" /> Yes — activate the launch boost
                </div>
                <p className="text-sm text-muted-foreground">
                  TOP placement for {MKT_LAUNCH_PROMO_DAYS} days: your {itemLabel} stays above
                  standard ones in its category and in search results.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge className="bg-primary text-primary-foreground">
                    {MKT_LAUNCH_PROMO_CREDITS} credits · €5
                  </Badge>
                  <span className="text-xs text-muted-foreground line-through">
                    normally {MKT_LAUNCH_PROMO_REGULAR_CREDITS} credits · €22.50
                  </span>
                  <Badge variant="outline">one-time launch offer</Badge>
                </div>
              </div>
              {choice === "promo" && <Check className="h-5 w-5 shrink-0 text-primary" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setChoice("plain")}
            className={`mkt-promo-option w-full rounded-xl border p-4 text-left transition ${
              choice === "plain" ? "border-primary bg-primary/5 ring-1 ring-primary/40" : "border-border"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="font-semibold">No thanks — just publish it</div>
                <p className="text-sm text-muted-foreground">
                  It is published for free. You can promote it any time later from your own
                  {" "}{itemLabel} card (from {MKT_LAUNCH_PROMO_REGULAR_CREDITS} credits for 30 days).
                </p>
              </div>
              {choice === "plain" && <Check className="h-5 w-5 shrink-0 text-primary" />}
            </div>
          </button>

          <p className="text-xs text-muted-foreground">
            Your balance: {balance === null ? "—" : `${balance} credits`}.
            {notEnough && choice === "promo"
              ? " Not enough credits — we will publish without the boost and take you to the top-up page."
              : ""}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
            className="sm:mr-auto"
          >
            Back to editing
          </Button>
          <Button
            disabled={busy}
            onClick={choice === "promo" ? onPublishWithPromo : onPublishWithoutPromo}
            className="gap-2"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {choice === "promo"
              ? `Publish + boost · ${MKT_LAUNCH_PROMO_CREDITS} credits`
              : "Publish now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
