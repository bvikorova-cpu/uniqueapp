import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Zap, Info } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getUserFriendlyErrorMessage } from "@/utils/errorHandler";
import { motion } from "framer-motion";

interface BuyVotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VOTE_PACKAGES = [
  { id: "5-votes", votes: 5, price: "2€", priceId: "price_1SSDabGaXSfGtYFtjBhb6kVr", popular: false },
  { id: "10-votes", votes: 10, price: "3€", priceId: "price_1SSDacGaXSfGtYFtYnW8omLQ", popular: true },
  { id: "50-votes", votes: 50, price: "10€", priceId: "price_1SSDadGaXSfGtYFthJDJ0sYd", popular: false, badge: "Best Value" },
  { id: "100-votes", votes: 100, price: "20€", priceId: "price_1SSDmg0QTWhd4oRp8S8VrIeM", popular: false, badge: "Bulk Discount" },
];

export const BuyVotesDialog = ({ open, onOpenChange }: BuyVotesDialogProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleBuyVotes = async (priceId: string, votes: number) => {
    setLoading(priceId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please sign in", description: "You need to be signed in to purchase votes.", variant: "destructive" });
        return;
      }
      const { data, error } = await supabase.functions.invoke("create-brand-votes-payment", { body: { priceId } });
      if (error) throw error;
      if (data?.url) {
        const win = window.open(data.url, "_blank");
        if (!win || win.closed || typeof win.closed === "undefined") {
          toast({ title: "Popup blocked", description: "Please allow popups, or click the link to continue.", variant: "destructive" });
          return;
        }
        toast({ title: "Payment created", description: `We've opened the payment gateway for ${votes} votes.` });
      } else {
        toast({ title: "Checkout unavailable", description: "Please try again later.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Error creating payment:", error);
      toast({ title: "Error creating payment", description: getUserFriendlyErrorMessage(error, "Failed to process payment"), variant: "destructive" });
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
            Buy Extra Votes
          </DialogTitle>
          <DialogDescription>Choose a vote package. Purchased votes can be used today.</DialogDescription>
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
                  <div className="text-2xl font-bold text-primary">{pkg.price}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {(parseFloat(pkg.price) / pkg.votes).toFixed(2)}€ per vote
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
                  onClick={() => handleBuyVotes(pkg.priceId, pkg.votes)}
                  disabled={loading !== null}
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                >
                  {loading === pkg.priceId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Buy Now"
                  )}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-primary/5 flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Purchased votes are valid for today only. Tomorrow you'll receive 1 free vote again.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
