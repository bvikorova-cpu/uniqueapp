import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Star, Gift } from "lucide-react";
import { applyReferralCode } from "@/lib/referralCode";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Shown when a registered user without an active MegaTalent subscription tries
 * to upload / publish a submission. Browsing and voting stay free for every
 * registered user — publishing requires Premium (€10) or TOP Premium (€15).
 */
const MegatalentUploadPaywallDialog = ({ open, onOpenChange }: Props) => {
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<null | "premium" | "top_premium">(null);
  const [referralCode, setReferralCode] = useState("");

  const startCheckout = async (tier: "premium" | "top_premium") => {
    setLoadingTier(tier);
    try {
      // Optional referral code — attribute it before payment so the code owner
      // automatically gets their €5 reward once the subscription is paid.
      if (referralCode.trim()) {
        const res = await applyReferralCode(referralCode);
        if (!res.ok) {
          toast({
            title: "Invalid referral code",
            description: res.error ?? "Please check the code or leave it empty.",
            variant: "destructive" });
          setLoadingTier(null);
          return;
        }
        toast({
          title: res.alreadyClaimed ? "Referral already applied" : "Referral code applied ✅",
          description: res.alreadyClaimed
            ? "A referral code is already linked to your account."
            : "Your inviter will receive their €5 bonus after your payment." });
      }
      const url = await startMegatalentCheckout(tier, referralCode);
      const w = window.open(url, "_blank", "noopener,noreferrer");
      if (!w) window.location.href = url;

    } catch (err: any) {
      toast({
        title: "Checkout failed",
        description: err?.message ?? "Could not start checkout. Please try again.",
        variant: "destructive" });
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-base sm:text-xl pr-6">Choose a plan to publish 🏆</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Browsing and voting are free for every registered user. To upload and publish your
            submission, pick a MegaTalent subscription.
          </DialogDescription>
        </DialogHeader>

        <ul className="text-xs sm:text-sm space-y-1.5 bg-muted/40 rounded-lg p-3">
          <li>✅ Unlimited photo &amp; video uploads</li>
          <li>✅ Access to all 35+ categories</li>
          <li>✅ Eligible for cash prizes for winners</li>
        </ul>


        <div className="space-y-1.5">
          <Label htmlFor="mt-referral" className="text-sm flex items-center gap-1.5">
            <Gift className="h-3.5 w-3.5 text-primary" /> Referral code (optional)
          </Label>
          <Input
            id="mt-referral"
            placeholder="e.g. UNIQ-1A2B3C"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            disabled={loadingTier !== null}
            maxLength={64}
          />
          <p className="text-xs text-muted-foreground">
            Got a code from a friend? Enter it and they receive a €5 bonus after your payment.
          </p>
        </div>

        <div className="space-y-2">
          <Button
            size="lg"
            className="w-full justify-between gap-2 px-3 text-sm"
            onClick={() => startCheckout("premium")}
            disabled={loadingTier !== null}
          >
            <span className="flex items-center gap-2 min-w-0"><Star className="h-4 w-4 shrink-0" /> Premium</span>
            <span className="font-bold shrink-0 whitespace-nowrap">
              {loadingTier === "premium" ? <Loader2 className="h-4 w-4 animate-spin" /> : "€10 / month"}
            </span>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="w-full justify-between gap-2 px-3 h-auto py-2.5 text-sm"
            onClick={() => startCheckout("top_premium")}
            disabled={loadingTier !== null}
          >
            <span className="flex flex-col items-start min-w-0 text-left">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 fill-current shrink-0" /> TOP Premium
              </span>
              <span className="text-[10px] opacity-80">2× vote weight</span>
            </span>
            <span className="font-bold shrink-0 whitespace-nowrap">
              {loadingTier === "top_premium" ? <Loader2 className="h-4 w-4 animate-spin" /> : "€15 / month"}
            </span>
          </Button>

          <p className="text-xs text-muted-foreground text-center pt-1">
            Already paid?{" "}
            <button className="underline" onClick={() => window.location.reload()}>Refresh access</button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MegatalentUploadPaywallDialog;
