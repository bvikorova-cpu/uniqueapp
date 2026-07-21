import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, ExternalLink, ArrowLeft, Inbox } from "lucide-react";
import { format } from "date-fns";

interface GiftRow {
  id: string;
  creator_id: string;
  gift_id: string | null;
  amount: number;
  message: string | null;
  stripe_session_id: string | null;
  status: string;
  created_at: string;
  gift?: { name: string; icon: string | null } | null;
  creator?: { username: string | null; display_name: string | null } | null;
}

const statusVariant = (s: string) =>
  s === "paid" ? "default" : s === "pending" ? "secondary" : "destructive";

export default function GiftHistory() {
  const [rows, setRows] = useState<GiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setLoading(false);
        return;
      }
      setUserId(auth.user.id);
      const { data, error } = await supabase
        .from("creator_gift_transactions")
        .select(
          "id, creator_id, gift_id, amount, message, stripe_session_id, status, created_at, gift:creator_gifts(name, icon)",
        )
        .eq("sender_id", auth.user.id)
        .order("created_at", { ascending: false })
        .limit(200);
      let enriched = (data as unknown as GiftRow[]) ?? [];
      if (!error && enriched.length) {
        const ids = [...new Set(enriched.map((r) => r.creator_id))];
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, username, display_name")
          .in("id", ids);
        const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
        enriched = enriched.map((r) => ({ ...r, creator: map.get(r.creator_id) ?? null }));
      }
      setRows(enriched);
      setLoading(false);
    })();

    const channel = supabase
      .channel("gift-history-self")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "creator_gift_transactions" },
        (payload) => {
          setRows((prev) =>
            prev.map((r) =>
              r.id === (payload.new as any).id
                ? { ...r, status: (payload.new as any).status, stripe_session_id: (payload.new as any).stripe_session_id ?? r.stripe_session_id }
                : r,
            ),
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const total = rows.reduce((sum, r) => (r.status === "paid" ? sum + Number(r.amount) : sum), 0);

  return (
    <div className="container max-w-3xl py-6 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/profile"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
        </Button>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Total gifted</div>
          <div className="text-lg font-semibold">€{total.toFixed(2)}</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" /> Gift history
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          ) : !userId ? (
            <p className="text-sm text-muted-foreground">Sign in to view your gift history.</p>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground">
              <Inbox className="h-10 w-10 mb-2 opacity-60" />
              <p className="text-sm">You haven't sent any gifts yet.</p>
            </div>
          ) : (
            rows.map((r) => {
              const creatorName = r.creator?.display_name || r.creator?.username || "creator";
              const giftLabel = r.gift?.name
                ? `${r.gift.icon ?? "🎁"} ${r.gift.name}`
                : "🎁 Gift";
              const stripeUrl = r.stripe_session_id
                ? `https://dashboard.stripe.com/payments/${r.stripe_session_id}`
                : null;
              return (
                <div
                  key={r.id}
                  className="rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{giftLabel}</span>
                      <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                      <span className="text-sm text-muted-foreground">
                        €{Number(r.amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      To{" "}
                      <Link
                        to={`/creator/${r.creator_id}`}
                        className="underline hover:text-foreground"
                      >
                        {creatorName}
                      </Link>{" "}
                      · {format(new Date(r.created_at), "d MMM yyyy, HH:mm")}
                    </div>
                    {r.message && (
                      <p className="text-sm mt-1 italic line-clamp-2">"{r.message}"</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {stripeUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={stripeUrl} target="_blank" rel="noopener noreferrer">
                          Stripe <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                    {r.status === "pending" && r.stripe_session_id && (
                      <Button size="sm" asChild>
                        <Link to={`/gift/success?id=${r.id}&session_id=${r.stripe_session_id}`}>
                          Verify
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
