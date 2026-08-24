import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BOOST_COST = 5;

interface Props {
  submissionId: string;
  category: string;
  onBoosted?: () => void;
}

export default function MegatalentBoostButton({ submissionId, category, onBoosted }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const boost = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("boost_megatalent_with_credits", {
        p_submission_id: submissionId,
        p_category: category,
        p_cost: BOOST_COST,
      });
      if (error) throw error;
      const res = data as any;
      if (!res?.success) {
        const msg =
          res?.error === "insufficient_credits"
            ? `You need ${BOOST_COST} AI credits to boost.`
            : res?.error === "already_boosted"
              ? "This submission is already boosted."
              : res?.error === "not_owner"
                ? "You can only boost your own submission."
                : "Boost failed.";
        toast({ title: "Boost not applied", description: msg, variant: "destructive" });
        return;
      }
      toast({ title: "🚀 Boost active!", description: `${BOOST_COST} credits used. Spotlighted for 24h.` });
      onBoosted?.();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={boost}
      disabled={loading}
      size="sm"
      variant="outline"
      className="gap-1.5 h-8 shrink-0 px-2 border-amber-500/40 hover:border-amber-500 text-amber-500 hover:bg-amber-500/10"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
      <span className="text-xs font-bold whitespace-nowrap hidden sm:inline">Boost {BOOST_COST}</span>
      <span className="text-xs font-bold whitespace-nowrap sm:hidden">Boost</span>
    </Button>
  );
}
