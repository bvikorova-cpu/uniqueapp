import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Star } from "lucide-react";
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

  const startCheckout = async (tier: "premium" | "top_premium") => {
    setLoadingTier(tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-megatalent-checkout", {
        body: { tier } });
      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");
      const w = window.open(data.url, "_blank", "noopener,noreferrer");
      if (!w) window.location.href = data.url;
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose a plan to publish 🏆</DialogTitle>
          <DialogDescription>
            Browsing and voting are free for every registered user. To upload and publish your
            submission, pick a MegaTalent subscription.
          </DialogDescription>
        </DialogHeader>

        <ul className="text-sm space-y-1.5 bg-muted/40 rounded-lg p-3">
          <li>✅ Unlimited photo &amp; video uploads</li>
          <li>✅ Access to all 35+ categories</li>
          <li>✅ Eligible for cash prizes for winners</li>
        </ul>

        <div className="space-y-2">
          <Button
            size="lg"
            className="w-full justify-between"
            onClick={() => startCheckout("premium")}
            disabled={loadingTier !== null}
          >
            <span className="flex items-center gap-2"><Star className="h-4 w-4" /> Premium</span>
            <span className="font-bold">
              {loadingTier === "premium" ? <Loader2 className="h-4 w-4 animate-spin" /> : "€10 / month"}
            </span>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="w-full justify-between"
            onClick={() => startCheckout("top_premium")}
            disabled={loadingTier !== null}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 fill-current" /> TOP Premium
              <span className="text-xs opacity-80">(2× vote weight)</span>
            </span>
            <span className="font-bold">
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
