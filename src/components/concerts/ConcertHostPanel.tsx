import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Gift, Loader2, MessageCircle, Users, Wallet, Ticket, Percent, TrendingUp } from "lucide-react";
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
  const [ticketRevenue, setTicketRevenue] = useState(0);
  const [ticketCount, setTicketCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [
        { data: giftRows, error: giftsError },
        { data: catalog, error: catalogError },
        { data: concert, error: concertError },
        { data: ticketRows },
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
        supabase
          .from("concert_ticket_purchases")
          .select("amount, payment_status")
          .eq("concert_id", concertId),
      ]);
      if (cancelled) return;
      const queryError = giftsError || catalogError || concertError;
      setLoadError(queryError?.message || null);
      setGifts((giftRows as GiftRow[]) || []);
      setViewerCount(Number(concert?.viewer_count || 0));
      const paidTickets = (ticketRows || []).filter((t: any) =>
        PAID.includes(String(t.payment_status || "").toLowerCase())
      );
      setTicketCount(paidTickets.length);
      setTicketRevenue(paidTickets.reduce((s: number, t: any) => s + Number(t.amount || 0), 0));

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

  // Real-time viewer count from the same presence channel fans join.
  useEffect(() => {
    const ch = supabase.channel(`concert-presence-${concertId}`, {
      config: { presence: { key: `host-panel-${concertId}` } },
    });
    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState() as Record<string, unknown[]>;
      const n = Object.keys(state).filter((k) => !k.startsWith("host")).length;
      setPresenceViewers(n);
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [concertId]);

  const liveViewers = Math.max(presenceViewers, viewerCount);

  const totals = useMemo(() => {
    const paid = gifts.filter((g) => PAID.includes((g.status || "").toLowerCase()));
    const giftGross = paid.reduce((s, g) => s + Number(g.amount || 0), 0);
    const gross = giftGross + ticketRevenue;
    const yours = gross * 0.8;
    const fee = gross * 0.2;
    return { gross, giftGross, ticketGross: ticketRevenue, yours, fee, count: paid.length };
  }, [gifts, ticketRevenue]);


  const StatCard = ({
    icon: Icon,
    label,
    value,
    sub,
    accent = "primary",
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub?: string;
    accent?: "primary" | "accent" | "success";
  }) => {
    const accentClass =
      accent === "accent"
        ? "from-accent/15 to-accent/5 text-accent"
        : accent === "success"
          ? "from-success/15 to-success/5 text-success"
          : "from-primary/15 to-primary/5 text-primary";
    return (
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br p-3 transition-shadow hover:shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-black">{value}</p>
            {sub && <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>}
          </div>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${accentClass}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-b from-card to-card/95 shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-3 pt-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-glow">
            <MessageCircle className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          Live fan panel
          <Badge variant="secondary" className="ml-auto gap-1 font-normal">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Framed stats table */}
        <div className="rounded-xl border bg-card/60 p-1">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
            <StatCard icon={Users} label="Viewers" value={viewerCount} sub="watching now" />
            <StatCard icon={Ticket} label="Tickets" value={ticketCount} sub="paid sales" />
            <StatCard icon={Gift} label="Gifts" value={totals.count} sub="received" accent="accent" />
            <StatCard icon={TrendingUp} label="Gross" value={`€${totals.gross.toFixed(2)}`} sub="tickets + gifts" accent="success" />
          </div>

          {/* Highlighted artist share row */}
          <div className="mt-1 rounded-lg border bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-glow">
                  <Wallet className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Your artist share</p>
                  <p className="text-xs text-muted-foreground">80% of tickets + gifts</p>
                </div>
              </div>
              <p className="text-2xl font-black text-primary">€{totals.yours.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {loadError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
            Live data could not refresh: {loadError}
          </p>
        )}

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-lg border bg-muted/40 p-1">
            <TabsTrigger value="chat" className="gap-1 rounded-md text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <MessageCircle className="h-3.5 w-3.5" /> Chat
            </TabsTrigger>
            <TabsTrigger value="gifts" className="gap-1 rounded-md text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Gift className="h-3.5 w-3.5" /> Gifts
              {totals.count > 0 && <Badge variant="secondary" className="ml-1 h-4 min-w-[1rem] px-1 text-[10px]">{totals.count}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="earnings" className="gap-1 rounded-md text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Wallet className="h-3.5 w-3.5" /> Earnings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-3 rounded-xl border p-1">
            <div className="h-[320px] sm:h-[380px]">
              <ConcertChat embedded roomId={concertId} onBack={() => {}} />
            </div>
          </TabsContent>

          <TabsContent value="gifts" className="mt-3 rounded-xl border p-3">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : gifts.length === 0 ? (
              <div className="rounded-lg border border-dashed py-10 text-center">
                <Gift className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">No gifts yet</p>
                <p className="text-xs text-muted-foreground">Fans can send gifts while you are live.</p>
              </div>
            ) : (
              <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                {gifts.map((g) => {
                  const meta = giftNames[g.gift_id];
                  const isPaid = PAID.includes((g.status || "").toLowerCase());
                  return (
                    <div key={g.id} className="flex items-center gap-3 rounded-lg border bg-card p-2.5 transition-colors hover:bg-muted/30">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-2xl">
                        {meta?.icon || "🎁"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{meta?.name || "Gift"}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {g.created_at ? new Date(g.created_at).toLocaleTimeString() : ""}
                          {!isPaid && <span className="ml-1 text-amber-500">· pending payment</span>}
                        </p>
                        {g.message && <p className="truncate text-xs text-muted-foreground">“{g.message}”</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">€{Number(g.amount).toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground">€{(Number(g.amount) * 0.8).toFixed(2)} your share</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="earnings" className="mt-3 rounded-xl border p-3">
            <div className="rounded-lg border bg-gradient-to-br from-primary/10 to-accent/10 p-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your share (80%)</p>
              <p className="mt-1 text-3xl font-black text-primary">€{totals.yours.toFixed(2)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                From {ticketCount} ticket{ticketCount === 1 ? "" : "s"} and {totals.count} paid gift{totals.count === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-3 rounded-lg border">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="flex items-center gap-2 py-3 text-muted-foreground">
                      <Ticket className="h-3.5 w-3.5 text-primary" /> Ticket sales
                    </TableCell>
                    <TableCell className="py-3 text-right font-semibold">€{totals.ticketGross.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="flex items-center gap-2 py-3 text-muted-foreground">
                      <Gift className="h-3.5 w-3.5 text-accent" /> Gross gifts
                    </TableCell>
                    <TableCell className="py-3 text-right font-semibold">€{totals.giftGross.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="flex items-center gap-2 py-3 text-muted-foreground">
                      <TrendingUp className="h-3.5 w-3.5 text-success" /> Total revenue
                    </TableCell>
                    <TableCell className="py-3 text-right font-bold">€{totals.gross.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow className="border-b-0">
                    <TableCell className="flex items-center gap-2 py-3 text-muted-foreground">
                      <Percent className="h-3.5 w-3.5 text-muted-foreground" /> Platform fee (20%)
                    </TableCell>
                    <TableCell className="py-3 text-right font-semibold text-muted-foreground">€{totals.fee.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Ticket and gift revenue is split <span className="font-semibold text-foreground">80% artist</span> /{" "}
              <span className="font-semibold text-foreground">20% platform</span> and paid out to your connected account.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConcertHostPanel;
