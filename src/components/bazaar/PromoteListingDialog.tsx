import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Flame, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  itemId: string;
  itemTitle: string;
  onPromoted?: () => void;
}

const PLANS = [
  { id: "bump", name: "Bump", icon: Flame, cost: 5, days: 7, perk: "Re-surface to top of newest feed" },
  { id: "top", name: "TOP", icon: Crown, cost: 15, days: 7, perk: "Pinned above all listings + 'TOP' badge" },
] as const;

export const PromoteListingDialog = ({ open, onOpenChange, itemId, itemTitle, onPromoted }: Props) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState<string | null>(null);

  const promote = async (plan: "bump" | "top") => {
    setSubmitting(plan);
    const { data, error } = await supabase.rpc("bazaar_promote_listing" as any, {
      p_item_id: itemId,
      p_plan: plan,
    });
    setSubmitting(null);
    if (error) {
      toast({ title: "Could not promote", description: error.message, variant: "destructive" });
      return;
    }
    const result: any = data;
    toast({
      title: plan === "top" ? "Listing TOP'd 👑" : "Listing bumped 🔥",
      description: `Active for 7 days. ${result?.credits_remaining ?? 0} credits left.`,
    });
    onPromoted?.();
    onOpenChange(false);
  };

  return (
    <>
      <FloatingHowItWorks title="How Promote Listing Dialog works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promote listing</DialogTitle>
          <DialogDescription className="truncate">{itemTitle}</DialogDescription>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 gap-3">
          {PLANS.map((p) => {
            const Icon = p.icon;
            const isLoading = submitting === p.id;
            return (
              <Card key={p.id} className={cn("border-2 hover:border-primary/60 transition", p.id === "top" && "border-primary/40")}> 
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg flex items-center gap-2">
                      <Icon className={cn("h-5 w-5", p.id === "top" ? "text-yellow-500" : "text-orange-500")} />
                      {p.name}
                    </span>
                    <span className="text-sm font-semibold">{p.cost} CR</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.perk}</p>
                  <p className="text-xs">Duration: <strong>{p.days} days</strong></p>
                  <Button
                    className="w-full"
                    size="sm"
                    variant={p.id === "top" ? "default" : "outline"}
                    onClick={() => promote(p.id)}
                    disabled={!!submitting}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Promote
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <DialogFooter>
          <p className="text-[11px] text-muted-foreground">
            Credits are deducted from your Creative Forge balance. Promotions stack — buying again extends the timer.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
    );
};

export default PromoteListingDialog;
