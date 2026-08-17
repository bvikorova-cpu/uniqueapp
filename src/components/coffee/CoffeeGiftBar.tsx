import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CoffeeGift {
  id: string;
  name: string;
  icon: string;
  credit_cost: number;
}

/**
 * Credit-paid gift strip shown inside a Coffee Buddy chat.
 * Every gift is charged from the unified ai_credits pool via
 * the `coffee_send_gift` RPC (which also posts a chat message).
 */
export const CoffeeGiftBar = ({ matchId }: { matchId: string | null }) => {
  const [sendingId, setSendingId] = useState<string | null>(null);

  const { data: gifts = [] } = useQuery({
    queryKey: ["coffee-gift-catalog"],
    queryFn: async (): Promise<CoffeeGift[]> => {
      const { data, error } = await (supabase as any)
        .from("coffee_gifts_catalog")
        .select("id,name,icon,credit_cost")
        .eq("is_active", true)
        .order("credit_cost", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CoffeeGift[];
    },
  });

  const sendGift = async (gift: CoffeeGift) => {
    if (!matchId) return;
    setSendingId(gift.id);
    try {
      const { data, error } = await (supabase as any).rpc("coffee_send_gift", {
        _match_id: matchId,
        _gift_id: gift.id,
        _message: null,
      });
      if (error) throw error;
      if (data?.insufficient_credits) {
        toast.error("Not enough credits", {
          description: `${gift.name} costs ${gift.credit_cost} credits.`,
          action: { label: "Top up", onClick: () => (window.location.href = "/ai-credits-store") },
        });
        return;
      }
      toast.success(`${gift.icon} ${gift.name} sent!`, { description: `-${gift.credit_cost} credits` });
      window.dispatchEvent(new Event("ai-credits-updated"));
    } catch (e: any) {
      toast.error(e?.message || "Failed to send gift");
    } finally {
      setSendingId(null);
    }
  };

  if (gifts.length === 0) return null;

  return (
    <div className="px-3 pt-2 border-t border-amber-500/20">
      <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-muted-foreground">
        <Gift className="h-3.5 w-3.5 text-amber-400" />
        Send a paid gift (credits)
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {gifts.map((g) => (
          <Button
            key={g.id}
            size="sm"
            variant="outline"
            disabled={!!sendingId || !matchId}
            onClick={() => sendGift(g)}
            className="flex-shrink-0 border-amber-500/30 hover:border-amber-500/60 gap-1.5"
          >
            {sendingId === g.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span aria-hidden>{g.icon}</span>
            )}
            <span className="text-xs">{g.name}</span>
            <span className="text-[10px] text-amber-400 font-semibold">{g.credit_cost}c</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
