import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Gift } from "lucide-react";
import { toast } from "sonner";

interface Props { showId: string; }

/** Paid (EUR) virtual gifts for live comedy shows — mirrors Live Concerts. */
export const ComedyGiftsPanel = ({ showId }: Props) => {
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const { data: gifts, isLoading } = useQuery({
    queryKey: ["platform-gifts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_gifts").select("*").order("price", { ascending: true });
      if (error) throw error;
      return data;
    } });

  const sendGift = async (giftId: string) => {
    setSendingId(giftId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }
      let url: string | undefined;
      try {
        const { data, error } = await supabase.functions.invoke("send-comedy-gift", {
          body: { showId, giftId, message } });
        if (error) throw error;
        url = (data as any)?.url;
      } catch (invokeErr: any) {
        // FunctionsFetchError (preflight/network hiccup in the mobile preview iframe)
        // — retry with a plain fetch straight to the function endpoint.
        const res = await fetch(
          `https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/send-concert-gift`,
          { method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ showId, giftId, message, context: "comedy" }) });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((json as any)?.error || invokeErr?.message || "Failed to send gift");
        url = (json as any)?.url;
      }
      if (!url) throw new Error("Checkout URL missing");

      // Stripe Checkout refuses to render inside the preview iframe — open a new tab.
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (!win) {
        try { window.top!.location.href = url; } catch { window.location.href = url; }
      } else {
        toast.success("Checkout opened in a new tab");
      }
      setMessage("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to send gift");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-medium flex items-center gap-2">
          <Gift className="h-4 w-4 text-pink-500" /> Send a gift
        </p>
        <Badge variant="outline" className="text-[10px]">80% to comedian</Badge>
      </div>
      <Input
        placeholder="Add a message (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
        Paid in EUR · Platform fee 20% · Comedian receives 80%
      </p>
    </div>
  );
};
