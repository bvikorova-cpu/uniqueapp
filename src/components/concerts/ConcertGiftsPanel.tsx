import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Gift } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { concertId: string; }

export const ConcertGiftsPanel = ({ concertId }: Props) => {
  const [sendingId, setSendingId] = useState<string | null>(null);

  const { data: gifts, isLoading } = useQuery({
    queryKey: ["platform-gifts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_gifts").select("*").order("price", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const sendGift = async (giftId: string) => {
    setSendingId(giftId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("send-concert-gift", {
        body: { concertId, giftId },
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (!url) throw new Error("Checkout URL missing");
      window.location.href = url;
    } catch (e: any) {
      toast.error(e?.message || "Failed to send gift");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Concert Gifts Panel works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2"><Gift className="h-4 w-4 text-pink-500" />Send a gift</h3>
        <Badge variant="outline" className="text-[10px]">80% to artist</Badge>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {gifts?.map((g: any) => (
            <button
              key={g.id}
              onClick={() => sendGift(g.id)}
              disabled={sendingId === g.id}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border bg-card hover:border-primary hover:scale-[1.03] transition disabled:opacity-50"
            >
              <span className="text-2xl">{g.icon}</span>
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">{g.name}</span>
              <span className="text-xs font-bold text-primary">€{Number(g.price).toFixed(2)}</span>
              {sendingId === g.id && <Loader2 className="h-3 w-3 animate-spin" />}
            </button>
          ))}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground text-center">
        Platform fee 20% · Artist receives 80% of every gift
      </p>
    </div>
    </>
    );
};
