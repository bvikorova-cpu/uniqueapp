import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, Activity, AlertTriangle, Zap, Dices, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { exportToCsv } from "@/lib/exportCsv";

/**
 * Admin Rewards Audit — consolidated view of:
 * - lucky_spin_log (last 200)
 * - xp_bets (active + recently resolved)
 * - rewarded_ad_views aggregates + fraud flags
 *
 * Read-only. Surfaces anomalies (stuck active bets, fraud counts, payout drift).
 */
export default function AdminRewardsAudit() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  const stats = useQuery({
    queryKey: ["rewards-audit-stats"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const since24h = new Date(Date.now() - 24 * 3600_000).toISOString();
      const since7d = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();
      const [spins, betsActive, betsStuck, views, fraud, xpPaid] = await Promise.all([
        supabase.from("lucky_spin_log").select("id", { count: "exact", head: true }).gte("created_at", since24h),
        supabase.from("xp_bets").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("xp_bets").select("id", { count: "exact", head: true }).eq("status", "active").lt("ends_at", new Date().toISOString()),
        supabase.from("rewarded_ad_views").select("id", { count: "exact", head: true }).gte("created_at", since24h),
        supabase.from("rewarded_ad_fraud_flags").select("id", { count: "exact", head: true }).gte("created_at", since7d),
        supabase.from("lucky_spin_log").select("xp_awarded").gte("created_at", since24h),
      ]);
      const xpSum = (xpPaid.data ?? []).reduce((a, r: any) => a + (r.xp_awarded ?? 0), 0);
      return {
        spins24h: spins.count ?? 0,
        betsActive: betsActive.count ?? 0,
        betsStuck: betsStuck.count ?? 0,
        views24h: views.count ?? 0,
        fraud7d: fraud.count ?? 0,
        xpSum24h: xpSum,
      };
    },
    refetchInterval: 30_000,
  });

  const spins = useQuery({
    queryKey: ["rewards-audit-spins"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lucky_spin_log")
        .select("id,user_id,prize_label,prize_kind,xp_awarded,item_code,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  const bets = useQuery({
    queryKey: ["rewards-audit-bets"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("xp_bets")
        .select("id,user_id,challenge_type,challenge_target,bet_amount,status,starts_at,ends_at,resolved_at,payout,progress")
        .order("starts_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  const fraud = useQuery({
    queryKey: ["rewards-audit-fraud"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewarded_ad_fraud_flags")
        .select("id,user_id,flag_date,view_count,reason,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (adminLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Admins only.</div>;
  }

  const s = stats.data;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild><Link to="/admin"><ArrowLeft className="h-4 w-4 mr-1" />Admin</Link></Button>
          <h1 className="text-2xl font-black">Rewards Audit</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild><Link to="/admin/xp-audit">XP Audit</Link></Button>
          <Button variant="outline" size="sm" asChild><Link to="/admin/xp-audit/reconciliation">Reconciliation</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <StatCard icon={Dices} label="Spins 24h" value={s?.spins24h ?? "…"} />
        <StatCard icon={Zap} label="XP given (spins) 24h" value={s?.xpSum24h ?? "…"} />
        <StatCard icon={Activity} label="Ad views 24h" value={s?.views24h ?? "…"} />
        <StatCard icon={Activity} label="Active bets" value={s?.betsActive ?? "…"} />
        <StatCard icon={AlertTriangle} label="Stuck bets (past end)" value={s?.betsStuck ?? "…"} alert={(s?.betsStuck ?? 0) > 0} />
        <StatCard icon={AlertTriangle} label="Fraud flags 7d" value={s?.fraud7d ?? "…"} alert={(s?.fraud7d ?? 0) > 0} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Dices className="h-5 w-5 text-primary" />Lucky Spin Log (last 200)</CardTitle>
          <Button size="sm" variant="outline" onClick={() => exportToCsv("lucky_spin_log.csv", spins.data ?? [])} disabled={!spins.data?.length}>Export CSV</Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Time</TableHead><TableHead>User</TableHead><TableHead>Prize</TableHead><TableHead>Kind</TableHead><TableHead className="text-right">XP</TableHead><TableHead>Item</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {spins.isLoading && <TableRow><TableCell colSpan={6}>Loading…</TableCell></TableRow>}
              {!spins.isLoading && !spins.data?.length && <TableRow><TableCell colSpan={6} className="text-muted-foreground text-center py-6">No spins yet.</TableCell></TableRow>}
              {spins.data?.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{format(new Date(r.created_at), "MM-dd HH:mm:ss")}</TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[120px]">{r.user_id}</TableCell>
                  <TableCell>{r.prize_label}</TableCell>
                  <TableCell><Badge variant="outline">{r.prize_kind}</Badge></TableCell>
                  <TableCell className="text-right font-semibold">{r.xp_awarded ?? 0}</TableCell>
                  <TableCell className="text-xs">{r.item_code ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" />XP Bets (last 200)</CardTitle>
          <Button size="sm" variant="outline" onClick={() => exportToCsv("xp_bets.csv", bets.data ?? [])} disabled={!bets.data?.length}>Export CSV</Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Status</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Bet</TableHead><TableHead className="text-right">Progress / Target</TableHead><TableHead className="text-right">Payout</TableHead><TableHead>Ends</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {bets.isLoading && <TableRow><TableCell colSpan={6}>Loading…</TableCell></TableRow>}
              {!bets.isLoading && !bets.data?.length && <TableRow><TableCell colSpan={6} className="text-muted-foreground text-center py-6">No bets yet.</TableCell></TableRow>}
              {bets.data?.map((r: any) => {
                const stuck = r.status === "active" && r.ends_at && new Date(r.ends_at) < new Date();
                return (
                  <TableRow key={r.id} className={stuck ? "bg-destructive/10" : ""}>
                    <TableCell><Badge variant={stuck ? "destructive" : r.status === "won" ? "default" : "outline"}>{stuck ? "STUCK" : r.status}</Badge></TableCell>
                    <TableCell className="text-xs">{r.challenge_type}</TableCell>
                    <TableCell className="text-right">{r.bet_amount}</TableCell>
                    <TableCell className="text-right">{r.progress ?? 0} / {r.challenge_target}</TableCell>
                    <TableCell className="text-right font-semibold">{r.payout ?? 0}</TableCell>
                    <TableCell className="font-mono text-xs">{r.ends_at ? format(new Date(r.ends_at), "MM-dd HH:mm") : "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />Rewarded Ad Fraud Flags</CardTitle>
          <Button size="sm" variant="outline" onClick={() => exportToCsv("fraud_flags.csv", fraud.data ?? [])} disabled={!fraud.data?.length}>Export CSV</Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Date</TableHead><TableHead>User</TableHead><TableHead className="text-right">Views</TableHead><TableHead>Reason</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {fraud.isLoading && <TableRow><TableCell colSpan={4}>Loading…</TableCell></TableRow>}
              {!fraud.isLoading && !fraud.data?.length && <TableRow><TableCell colSpan={4} className="text-muted-foreground text-center py-6">No flags — clean.</TableCell></TableRow>}
              {fraud.data?.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>{r.flag_date}</TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[160px]">{r.user_id}</TableCell>
                  <TableCell className="text-right font-semibold">{r.view_count}</TableCell>
                  <TableCell className="text-xs">{r.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, alert }: { icon: any; label: string; value: any; alert?: boolean }) {
  return (
    <Card className={alert ? "border-destructive/50 bg-destructive/5" : ""}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Icon className="h-3.5 w-3.5" />{label}</div>
        <div className={`text-2xl font-black ${alert ? "text-destructive" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
