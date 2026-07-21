import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Loader2 } from "lucide-react";
import { SendGiftDialog } from "./SendGiftDialog";

interface GiftTx {
  id: string;
  amount: number;
  message: string | null;
  created_at: string;
  sender_id: string;
  gift: { name: string; icon: string | null } | null;
  sender: { display_name: string | null; avatar_url: string | null } | null;
}

interface Props {
  creatorId: string;
  creatorName?: string;
  limit?: number;
}

export function GiftWall({ creatorId, creatorName = "creator", limit = 30 }: Props) {
  const [rows, setRows] = useState<GiftTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [openSend, setOpenSend] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("creator_gift_transactions")
      .select(
        "id, amount, message, created_at, sender_id, gift:creator_gifts(name, icon), sender:profiles!creator_gift_transactions_sender_id_fkey(display_name, avatar_url)",
      )
      .eq("creator_id", creatorId)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(limit);
    const list = (data as any as GiftTx[]) || [];
    setRows(list);
    setTotal(list.reduce((sum, r) => sum + Number(r.amount || 0), 0));
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`gift-wall-${creatorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "creator_gift_transactions",
          filter: `creator_id=eq.${creatorId}`,
        },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorId]);

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="h-5 w-5 text-primary" />
          Gift Wall
          {total > 0 && (
            <Badge variant="secondary" className="ml-2">
              €{total.toFixed(2)} received
            </Badge>
          )}
        </CardTitle>
        <Button size="sm" onClick={() => setOpenSend(true)}>
          <Gift className="h-4 w-4 mr-2" />
          Send gift
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Be the first to send a gift to {creatorName}! 🎁
          </div>
        ) : (
          <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors animate-in fade-in slide-in-from-bottom-1"
              >
                <div className="text-2xl" aria-hidden>
                  {r.gift?.icon ?? "🎁"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">
                      {r.sender?.display_name || "Anonymous"}
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      €{Number(r.amount).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    sent {r.gift?.name ?? "a gift"}
                    {r.message ? ` — "${r.message}"` : ""}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <SendGiftDialog
        open={openSend}
        onOpenChange={setOpenSend}
        creatorId={creatorId}
        creatorName={creatorName}
      />
    </Card>
  );
}
