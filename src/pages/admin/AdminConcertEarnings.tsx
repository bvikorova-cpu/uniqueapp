import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Music, Percent, TrendingUp, Ticket, Gift, Wallet } from "lucide-react";
import { SEO } from "@/components/SEO";

interface OverviewRow {
  musician_id: string;
  stage_name: string;
  verified: boolean;
  ticket_gross: number;
  gift_gross: number;
  total_gross: number;
  artist_share: number;
  platform_share: number;
  pending_balance: number;
  total_withdrawn: number;
  transactions: number;
}

interface WithdrawalRow {
  id: string;
  musician_id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  admin_notes: string | null;
  created_at: string | null;
}

const eur = (n: number) => `€${Number(n || 0).toFixed(2)}`;

export default function AdminConcertEarnings() {
  const [rows, setRows] = useState<OverviewRow[]>([]);
  const [requests, setRequests] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: overview, error }, { data: wr }] = await Promise.all([
        (supabase as any).rpc("admin_concert_earnings_overview"),
        (supabase as any)
          .from("musician_withdrawal_requests")
          .select("id, musician_id, amount, status, payment_method, admin_notes, created_at")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      if (error) throw error;
      setRows(((overview as OverviewRow[]) || []).map((r) => ({
        ...r,
        ticket_gross: Number(r.ticket_gross), gift_gross: Number(r.gift_gross),
        total_gross: Number(r.total_gross), artist_share: Number(r.artist_share),
        platform_share: Number(r.platform_share), pending_balance: Number(r.pending_balance),
        total_withdrawn: Number(r.total_withdrawn), transactions: Number(r.transactions),
      })));
      setRequests((wr as WithdrawalRow[]) || []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load concert earnings");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const totals = useMemo(() => rows.reduce((acc, r) => ({
    gross: acc.gross + r.total_gross,
    tickets: acc.tickets + r.ticket_gross,
    gifts: acc.gifts + r.gift_gross,
    artists: acc.artists + r.artist_share,
    platform: acc.platform + r.platform_share,
    pending: acc.pending + r.pending_balance,
    withdrawn: acc.withdrawn + r.total_withdrawn,
  }), { gross: 0, tickets: 0, gifts: 0, artists: 0, platform: 0, pending: 0, withdrawn: 0 }), [rows]);

  const process = async (id: string, status: "approved" | "rejected" | "completed") => {
    setBusyId(id);
    try {
      const { data: session } = await supabase.auth.getUser();
      const { error } = await (supabase as any).rpc("process_musician_withdrawal", {
        p_request_id: id,
        p_admin_id: session?.user?.id,
        p_status: status,
        p_admin_notes: null,
      });
      if (error) throw error;
      toast.success(`Withdrawal ${status}`);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const Stat = ({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) => (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-black">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Concert earnings — Admin" description="Platform revenue from live concert tickets and gifts with 80/20 split and artist payouts." />
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-6 pb-24">
        <div className="mb-6 flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-black">Concert earnings & payouts</h1>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat icon={TrendingUp} label="Total gross" value={eur(totals.gross)} sub="tickets + gifts" />
              <Stat icon={Percent} label="Platform (20%)" value={eur(totals.platform)} sub="your revenue" />
              <Stat icon={Music} label="Artists (80%)" value={eur(totals.artists)} sub="earned by artists" />
              <Stat icon={Wallet} label="Pending payouts" value={eur(totals.pending)} sub={`withdrawn ${eur(totals.withdrawn)}`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Stat icon={Ticket} label="Ticket sales" value={eur(totals.tickets)} />
              <Stat icon={Gift} label="Gifts" value={eur(totals.gifts)} />
            </div>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Per artist</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artist</TableHead>
                      <TableHead className="text-right">Tickets</TableHead>
                      <TableHead className="text-right">Gifts</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">Artist 80%</TableHead>
                      <TableHead className="text-right">Platform 20%</TableHead>
                      <TableHead className="text-right">Pending</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No earnings yet.</TableCell></TableRow>
                    )}
                    {rows.map((r) => (
                      <TableRow key={r.musician_id}>
                        <TableCell className="font-medium">
                          {r.stage_name}
                          {r.verified && <Badge variant="secondary" className="ml-2">Verified</Badge>}
                        </TableCell>
                        <TableCell className="text-right">{eur(r.ticket_gross)}</TableCell>
                        <TableCell className="text-right">{eur(r.gift_gross)}</TableCell>
                        <TableCell className="text-right font-semibold">{eur(r.total_gross)}</TableCell>
                        <TableCell className="text-right">{eur(r.artist_share)}</TableCell>
                        <TableCell className="text-right text-primary">{eur(r.platform_share)}</TableCell>
                        <TableCell className="text-right">{eur(r.pending_balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Withdrawal requests</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {requests.length === 0 && <p className="text-sm text-muted-foreground">No withdrawal requests.</p>}
                {requests.map((w) => {
                  const artist = rows.find((r) => r.musician_id === w.musician_id);
                  return (
                    <div key={w.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                      <div>
                        <p className="font-semibold">{artist?.stage_name || w.musician_id.slice(0, 8)} · {eur(w.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {w.payment_method || "no method"} · {w.created_at ? new Date(w.created_at).toLocaleString() : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={w.status === "completed" ? "default" : "secondary"}>{w.status}</Badge>
                        {w.status === "pending" && (
                          <>
                            <Button size="sm" disabled={busyId === w.id} onClick={() => process(w.id, "approved")}>Approve</Button>
                            <Button size="sm" variant="outline" disabled={busyId === w.id} onClick={() => process(w.id, "rejected")}>Reject</Button>
                          </>
                        )}
                        {w.status === "approved" && (
                          <Button size="sm" disabled={busyId === w.id} onClick={() => process(w.id, "completed")}>
                            {busyId === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark paid"}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground">
                  How payouts work: every paid ticket and gift is split 80% artist / 20% platform and added to the artist's
                  pending balance. Artists request a withdrawal, you approve it here and mark it paid after the bank/Stripe
                  transfer — that moves the amount from pending balance to total withdrawn.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
