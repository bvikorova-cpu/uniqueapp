import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Universal AI-credit purchase dialog wired to the `create-checkout` router.
 * Sends `{ creditType, credits }` — router resolves price + success/cancel URL.
 */

const CREDIT_TYPES: { value: string; label: string; pricePerCredit: number }[] = [
  { value: "iq", label: "IQ Platform", pricePerCredit: 0.5 },
  { value: "analyzer", label: "Analyzer", pricePerCredit: 0.5 },
  { value: "cooking", label: "Cooking", pricePerCredit: 0.5 },
  { value: "astrology", label: "Astrology", pricePerCredit: 0.5 },
  { value: "handwriting", label: "Handwriting", pricePerCredit: 0.5 },
  { value: "antique", label: "Antique Appraisal", pricePerCredit: 0.5 },
  { value: "video_ad", label: "Video Ad Creator", pricePerCredit: 0.5 },
  { value: "character", label: "AI Characters", pricePerCredit: 0.5 },
  { value: "chat", label: "Character Chat", pricePerCredit: 0.1 },
];

const CREDIT_AMOUNTS = [10, 25, 50, 100];

export function PurchaseAICreditsDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [creditType, setCreditType] = useState("iq");
  const [credits, setCredits] = useState(25);
  const [loading, setLoading] = useState(false);

  const selected = CREDIT_TYPES.find((c) => c.value === creditType)!;
  const total = (credits * selected.pricePerCredit).toFixed(2);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { creditType, credits },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");
      window.open(data.url, "_blank");
      setOpen(false);
    } catch (e: any) {
      toast({
        title: "Couldn't start checkout",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full">
          <Sparkles className="h-4 w-4 mr-2" />
          Purchase AI Credits
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase AI Credits</DialogTitle>
          <DialogDescription>
            Top up credits for any AI module. Paid via secure Stripe checkout.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="credit-type">Credit type</Label>
            <Select value={creditType} onValueChange={setCreditType}>
              <SelectTrigger id="credit-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CREDIT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label} — €{t.pricePerCredit.toFixed(2)}/credit
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-amount">Amount</Label>
            <Select
              value={String(credits)}
              onValueChange={(v) => setCredits(Number(v))}
            >
              <SelectTrigger id="credit-amount">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CREDIT_AMOUNTS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} credits
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold">€{total}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handlePurchase} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Continue to checkout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
