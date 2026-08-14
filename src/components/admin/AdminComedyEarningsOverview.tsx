import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Mic2, Percent, TrendingUp, Ticket, Gift, Wallet } from "lucide-react";

interface EarningRow {
  comedian_id: string;
  source_type: string | null;
  amount_coins: number | null;
  platform_commission: number | null;
  net_amount: number | null;
  pending_payout: number | null;
}

interface ComedianAgg {
  comedian_id: string;
  stage_name: string;
  verified: boolean;
  ticket_gross: number;
  gift_gross: number;
  total_gross: number;
  comedian_share: number;
  platform_share: number;
  pending_balance: number;
  transactions: number;
}

const eur = (n: number) => `€${Number(n || 0).toFixed(2)}`;
const isTicket = (t?: string | null) => (t || "").toLowerCase().includes("ticket");

/** Admin overview of Comedy Club revenue with the same 80/20 breakdown as Live Concerts. */
export function AdminComedyEarningsOverview() {
  const [rows, setRows] = useState<ComedianAgg[]>([]);
  const [withdrawn, setWithdrawn] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: earnings }, { data: profiles }, { data: paid }] = await Promise.all([
          supabase
            .from("comedian_earnings")
            .select("comedian_id, source_type, amount_coins, platform_commission, net_amount, pending_payout")
            .limit(5000),
          supabase.from("comedian_profiles").select("id, stage_name, is_verified"),
          supabase.from("comedian_withdrawal_requests").select("amount, status").eq("status", "completed"),
        ]);

        const nameById = new Map<string, { stage_name: string; verified: boolean }>();
        ((profiles as any[]) || []).forEach((p) =>
          nameById.set(p.id, { stage_name: p.stage_name || "Comedian", verified: !!p.is_verified })
        );

        const map = new Map<string, ComedianAgg>();
        ((earnings as EarningRow[]) || []).forEach((e) => {
          const gross = Number(e.amount_coins || 0);
          const platform = Number(e.platform_commission || 0);
          const net = Number(e.net_amount || 0);
          const prof = nameById.get(e.comedian_id);
          const agg =
            map.get(e.comedian_id) ||
            ({
              comedian_id: e.comedian_id,
              stage_name: prof?.stage_name || e.comedian_id.slice(0, 8),
              verified: prof?.verified || false,
              ticket_gross: 0,
              gift_gross: 0,
              total_gross: 0,
              comedian_share: 0,
              platform_share: 0,
              pending_balance: 0,
              transactions: 0,
            } as ComedianAgg);
          if (isTicket(e.source_type)) agg.ticket_gross += gross;
          else agg.gift_gross += gross;
          agg.total_gross += gross;
          agg.comedian_share += net;
          agg.platform_share += platform;
          agg.pending_balance += Number(e.pending_payout || 0);
          agg.transactions += 1;
          map.set(e.comedian_id, agg);
        });

        setRows([...map.values()].sort((a, b) => b.total_gross - a.total_gross));
        setWithdrawn((((paid as any[]) || []).reduce((s, w) => s + Number(w.amount || 0), 0)));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          gross: acc.gross + r.total_gross,
          tickets: acc.tickets + r.ticket_gross,
          gifts: acc.gifts + r.gift_gross,
          comedians: acc.comedians + r.comedian_share,
          platform: acc.platform + r.platform_share,
          pending: acc.pending + r.pending_balance,
        }),
        { gross: 0, tickets: 0, gifts: 0, comedians: 0, platform: 0, pending: 0 }
      ),
    [rows]
  );

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

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading comedy earnings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={TrendingUp} label="Total gross" value={eur(totals.gross)} sub="tickets + gifts" />
        <Stat icon={Percent} label="Platform (20%)" value={eur(totals.platform)} sub="your revenue" />
        <Stat icon={Mic2} label="Comedians (80%)" value={eur(totals.comedians)} sub="earned by comedians" />
        <Stat icon={Wallet} label="Pending payouts" value={eur(totals.pending)} sub={`withdrawn ${eur(withdrawn)}`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat icon={Ticket} label="Ticket sales" value={eur(totals.tickets)} />
        <Stat icon={Gift} label="Gifts" value={eur(totals.gifts)} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Per comedian</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comedian</TableHead>
                <TableHead className="text-right">Tickets</TableHead>
                <TableHead className="text-right">Gifts</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Comedian 80%</TableHead>
                <TableHead className="text-right">Platform 20%</TableHead>
                <TableHead className="text-right">Pending</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No earnings yet.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.comedian_id}>
                  <TableCell className="font-medium">
                    {r.stage_name}
                    {r.verified && <Badge variant="secondary" className="ml-2">Verified</Badge>}
                  </TableCell>
                  <TableCell className="text-right">{eur(r.ticket_gross)}</TableCell>
                  <TableCell className="text-right">{eur(r.gift_gross)}</TableCell>
                  <TableCell className="text-right font-semibold">{eur(r.total_gross)}</TableCell>
                  <TableCell className="text-right">{eur(r.comedian_share)}</TableCell>
                  <TableCell className="text-right text-primary">{eur(r.platform_share)}</TableCell>
                  <TableCell className="text-right">{eur(r.pending_balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        How payouts work: every paid ticket and gift is split 80% comedian / 20% platform and added to the comedian's
        pending balance. Comedians request a withdrawal, you approve it below and mark it paid after the transfer — that
        moves the amount from pending balance to withdrawn.
      </p>
    </div>
  );
}

export default AdminComedyEarningsOverview;
