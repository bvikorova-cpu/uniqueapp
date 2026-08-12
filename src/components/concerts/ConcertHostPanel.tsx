import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Loader2, MessageCircle, Users, Wallet } from "lucide-react";
import { ConcertChat } from "@/components/concerts/ConcertChat";

interface Props {
  concertId: string;
  /** musician_profiles.id of the host (gifts are stored against it). */
  musicianId: string;
}

interface GiftRow {
  id: string;
  gift_id: string;
  amount: number;
  message: string | null;
  created_at: string | null;
  status: string | null;
}

const PAID = ["paid", "completed", "succeeded"];

/**
 * Host-side live panel: fan chat, incoming gifts and the artist's 80% earnings
 * for the current concert. Read-only aggregation — no payout logic here.
 */
export const ConcertHostPanel = ({ concertId, musicianId }: Props) => {
  const [gifts, setGifts] = useState<GiftRow[]>([]);
  const [giftNames, setGiftNames] = useState<Record<string, { name: string; icon: string }>>({});
  const [viewerCount, setViewerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [
        { data: giftRows, error: giftsError },
        { data: catalog, error: catalogError },
        { data: concert, error: concertError },
      ] = await Promise.all([
        supabase
          .from("sent_platform_gifts")
          .select("id, gift_id, amount, message, created_at, status")
          .eq("context_type", "concert")
          .eq("context_id", concertId)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase.from("platform_gifts").select("id, name, icon"),
        supabase
          .from("live_concert_streams")
          .select("viewer_count")
          .eq("id", concertId)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      const queryError = giftsError || catalogError || concertError;
      setLoadError(queryError?.message || null);
      setGifts((giftRows as GiftRow[]) || []);
      setViewerCount(Number(concert?.viewer_count || 0));
      const map: Record<string, { name: string; icon: string }> = {};
      (catalog || []).forEach((g: any) => { map[g.id] = { name: g.name, icon: g.icon }; });
      setGiftNames(map);
      setLoading(false);
    };
    void load();

    const channel = supabase
      .channel(`concert-host-gifts-${concertId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sent_platform_gifts", filter: `context_id=eq.${concertId}` },
        () => void load()
      )
      .subscribe();
    const refresh = window.setInterval(load, 5_000);

    return () => {
      cancelled = true;
      window.clearInterval(refresh);
      supabase.removeChannel(channel);
    };
  }, [concertId, musicianId]);

  const totals = useMemo(() => {
    const paid = gifts.filter((g) => PAID.includes((g.status || "").toLowerCase()));
    const gross = paid.reduce((s, g) => s + Number(g.amount || 0), 0);
    const yours = gross * 0.8;
    const fee = gross * 0.2;
    return { gross, yours, fee, count: paid.length };
  }, [gifts]);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4 text-primary" /> Live fan panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg border p-3">
            <p className="text-[11px] text-muted-foreground">Viewers</p>
            <p className="flex items-center gap-1 text-lg font-bold">
              <Users className="h-4 w-4 text-primary" /> {viewerCount}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-[11px] text-muted-foreground">Paid gifts</p>
            <p className="text-lg font-bold">{totals.count}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-[11px] text-muted-foreground">Your 80% share</p>
            <p className="text-lg font-bold text-primary">€{totals.yours.toFixed(2)}</p>
          </div>
        </div>
        {loadError && (
          <p className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
            Live data could not refresh: {loadError}
          </p>
        )}
        <Tabs defaultValue="chat">
          <TabsList className="w-full">
            <TabsTrigger value="chat" className="flex-1 gap-1">
              <MessageCircle className="h-3.5 w-3.5" /> Chat
            </TabsTrigger>
            <TabsTrigger value="gifts" className="flex-1 gap-1">
              <Gift className="h-3.5 w-3.5" /> Gifts
              {totals.count > 0 && <Badge variant="secondary" className="ml-1">{totals.count}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex-1 gap-1">
              <Wallet className="h-3.5 w-3.5" /> Earnings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-3">
            <div className="h-[380px]">
              <ConcertChat embedded roomId={concertId} onBack={() => {}} />
            </div>
          </TabsContent>

          <TabsContent value="gifts" className="mt-3">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : gifts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No gifts yet — fans can send gifts while you are live.
              </p>
            ) : (
              <div className="max-h-[380px] space-y-2 overflow-y-auto">
                {gifts.map((g) => {
                  const meta = giftNames[g.gift_id];
                  const isPaid = PAID.includes((g.status || "").toLowerCase());
                  return (
                    <div key={g.id} className="flex items-center gap-3 rounded-lg border bg-card p-2">
                      <span className="text-2xl">{meta?.icon || "🎁"}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{meta?.name || "Gift"}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {g.created_at ? new Date(g.created_at).toLocaleTimeString() : ""}
                          {!isPaid && " · pending payment"}
                        </p>
                        {g.message && <p className="truncate text-xs">{g.message}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">
                          €{(Number(g.amount) * 0.8).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">of €{Number(g.amount).toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="earnings" className="mt-3 space-y-3">
            <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-accent/10 p-4">
              <p className="text-xs text-muted-foreground">Your share (80%)</p>
              <p className="text-3xl font-black text-primary">€{totals.yours.toFixed(2)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                From {totals.count} paid gift{totals.count === 1 ? "" : "s"} in this concert
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border p-3">
                <p className="text-[11px] text-muted-foreground">Gross gifts</p>
                <p className="text-lg font-bold">€{totals.gross.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-[11px] text-muted-foreground">Platform fee (20%)</p>
                <p className="text-lg font-bold">€{totals.fee.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Gift revenue is split 80% artist / 20% platform and paid out to your connected account.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConcertHostPanel;
