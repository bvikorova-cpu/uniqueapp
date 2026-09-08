import { Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2, Zap, Info, Coins } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getUserFriendlyErrorMessage } from "@/utils/errorHandler";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

interface BuyVotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Extra votes are paid from the unified AI credits wallet (no Stripe).
const VOTE_PACKAGES = [
  { id: "5-votes", votes: 5, credits: 5, popular: false },
  { id: "10-votes", votes: 10, credits: 9, popular: true },
  { id: "50-votes", votes: 50, credits: 40, popular: false, badge: "Best Value" },
  { id: "100-votes", votes: 100, credits: 75, popular: false, badge: "Bulk Discount" },
];

export const BuyVotesDialog = ({ open, onOpenChange }: BuyVotesDialogProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleBuyVotes = async (pkgId: string, votes: number) => {
    setLoading(pkgId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please sign in", description: "You need to be signed in to get extra votes.", variant: "destructive" });
        return;
      }

      const { error } = await (supabase as any).rpc("buy_brand_votes", { _votes: votes });
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["brand-votes"] });
      queryClient.invalidateQueries({ queryKey: ["ai-credits"] });
      queryClient.invalidateQueries({ queryKey: ["brand-battle-credits"] });
      window.dispatchEvent(new Event("ai-credits-updated"));

      toast({ title: `+${votes} votes added`, description: "Credits were deducted from your wallet." });
      onOpenChange(false);
    } catch (error: any) {
      const msg = (error?.message || "").toString();
      toast({
        title: msg.includes("insufficient") ? "Not enough credits" : "Couldn't add votes",
        description: msg.includes("insufficient")
          ? "Top up your credits and try again."
          : getUserFriendlyErrorMessage(error, "Failed to add votes"),
        variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl backdrop-blur-xl bg-card/95">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Get Extra Votes
          </DialogTitle>
          <DialogDescription>Pay with your AI credits. Extra votes can be used today.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {VOTE_PACKAGES.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                className={`p-6 relative backdrop-blur-sm hover:border-primary/30 transition-colors ${
                  pkg.popular ? "border-primary border-2 shadow-lg shadow-primary/10" : "border-primary/5"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    Popular
                  </div>
                )}
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {pkg.badge}
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className="text-4xl font-bold mb-2">{pkg.votes}</div>
                  <div className="text-sm text-muted-foreground mb-1">votes</div>
                  <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                    <Coins className="h-5 w-5" /> {pkg.credits}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {(pkg.credits / pkg.votes).toFixed(2)} credits per vote
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Instant activation</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Valid today</span>
                  </li>
                </ul>

                <Button
                  onClick={() => handleBuyVotes(pkg.id, pkg.votes)}
                  disabled={loading !== null}
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                >
                  {loading === pkg.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Use credits"
                  )}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-primary/5 flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Extra votes are valid for today only. Tomorrow you'll receive 1 free vote again.{" "}
            <Link to="/ai-credits" className="text-primary underline">
              Top up credits
            </Link>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
