import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Loader2 } from "lucide-react";

type TipRow = {
  id: string;
  amount_cents: number;
  creator_amount_cents: number | null;
  message: string | null;
  created_at: string;
  completed_at: string | null;
  payout_status: string | null;
  tipper_id: string | null;
  tipper_name: string | null;
  tipper_avatar_url: string | null;
};

type Sender = { name: string | null; avatar_url: string | null };

export const ReceivedTipsList = () => {
  const [tips, setTips] = useState<TipRow[]>([]);
  const [senders, setSenders] = useState<Record<string, Sender>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("megatalent_tips")
          .select("id, amount_cents, creator_amount_cents, message, created_at, completed_at, payout_status, tipper_id, tipper_name, tipper_avatar_url")
          .eq("creator_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(50);

        const rows = (data ?? []) as TipRow[];
        setTips(rows);

        // Fallback lookup for older rows that have no stored sender name.
        const ids = Array.from(
          new Set(rows.filter((t) => t.tipper_id && !t.tipper_name).map((t) => t.tipper_id)),
        ) as string[];
        if (ids.length) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, username, avatar_url")
            .in("id", ids);
          const map: Record<string, Sender> = {};
          (profiles ?? []).forEach((p: any) => {
            map[p.id] = { name: p.full_name || p.username, avatar_url: p.avatar_url };
          });
          setSenders(map);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  if (loading) {
    return (
      <Card className="p-6 flex items-center justify-center backdrop-blur-xl bg-card/60 border-border/30">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  return (
    <Card className="p-5 backdrop-blur-xl bg-card/60 border-border/30">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold">Gifts received</h3>
      </div>

      {tips.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No gifts yet. When someone sends you a gift, you will see who sent it, the amount and their message here.
        </p>
      ) : (
        <ul className="space-y-3">
          {tips.map((t) => {
            const s = t.tipper_id ? senders[t.tipper_id] : undefined;
            const name = t.tipper_name || s?.name || "Unique user";
            const avatar = t.tipper_avatar_url || s?.avatar_url;

            const gross = (t.amount_cents ?? 0) / 100;
            const yours = (t.creator_amount_cents ?? Math.round((t.amount_cents ?? 0) * 0.8)) / 100;
            return (
              <li
                key={t.id}
                className="flex gap-3 p-3 rounded-xl border border-border/30 bg-background/40"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={s?.avatar_url ?? undefined} alt={name} />
                  <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium truncate">{name}</span>
                    <span className="font-bold text-amber-500 whitespace-nowrap">€{gross.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.completed_at ?? t.created_at).toLocaleString()} · your share €{yours.toFixed(2)}
                  </p>
                  {t.message ? (
                    <p className="mt-2 text-sm italic break-words">“{t.message}”</p>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">No message</p>
                  )}
                  <Badge variant="secondary" className="mt-2 text-[10px]">
                    payout: {t.payout_status ?? "pending"}
                  </Badge>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};
