import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw, Leaf, HeartPulse, Euro, Users } from "lucide-react";
import { toast } from "sonner";

type Row = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  challenge: string;
  tier: string;
  active_until: string | null;
  is_active: boolean;
  started_at: string | null;
  months_billed: number;
  monthly_price_eur: number;
  total_paid_eur: number;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
};

const fmtDate = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function AdminChallengeSubscribers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<"all" | "eco" | "healthy">("all");
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).rpc("admin_challenge_subscribers", {
      _challenge: challenge === "all" ? null : challenge,
    });
    if (error) {
      toast.error("Failed to load subscribers", { description: error.message });
      setRows([]);
    } else {
      setRows((data as Row[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        (r.full_name || "").toLowerCase().includes(s) ||
        (r.email || "").toLowerCase().includes(s) ||
        (r.stripe_subscription_id || "").toLowerCase().includes(s),
    );
  }, [rows, q]);

  const stats = useMemo(() => {
    const active = filtered.filter((r) => r.is_active);
    return {
      total: filtered.length,
      active: active.length,
      pro: active.filter((r) => r.tier === "pro").length,
      top: active.filter((r) => r.tier === "top").length,
      mrr: active.reduce((a, r) => a + Number(r.monthly_price_eur || 0), 0),
      revenue: filtered.reduce((a, r) => a + Number(r.total_paid_eur || 0), 0),
    };
  }, [filtered]);

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <Helmet>
        <title>Challenge Subscribers | Admin</title>
        <meta name="description" content="Admin overview of Eco and Healthy Challenge subscriptions and payments." />
      </Helmet>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Challenge Subscribers</h1>
          <p className="text-sm text-muted-foreground">Eco &amp; Healthy Challenge subscriptions and payments.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Refresh</span>
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Active subs</p>
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-xs text-muted-foreground">{stats.total} total records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">PRO / TOP (active)</p>
            <p className="text-2xl font-bold">{stats.pro} / {stats.top}</p>
            <p className="text-xs text-muted-foreground">€3 / €5 per month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Euro className="h-3 w-3" /> MRR</p>
            <p className="text-2xl font-bold">€{stats.mrr.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Euro className="h-3 w-3" /> Total paid (est.)</p>
            <p className="text-2xl font-bold">€{stats.revenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">Subscribers</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <Tabs value={challenge} onValueChange={(v) => setChallenge(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="eco"><Leaf className="h-3.5 w-3.5 mr-1" /> Eco</TabsTrigger>
                <TabsTrigger value="healthy"><HeartPulse className="h-3.5 w-3.5 mr-1" /> Healthy</TabsTrigger>
              </TabsList>
            </Tabs>
            <Input
              placeholder="Search name, email, subscription ID"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="sm:w-72"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="py-10 text-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No subscribers found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Challenge</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Next period</TableHead>
                  <TableHead className="text-right">Months</TableHead>
                  <TableHead className="text-right">Paid (est.)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={`${r.user_id}-${r.challenge}`}>
                    <TableCell>
                      <div className="font-medium">{r.full_name || "User"}</div>
                      <div className="text-xs text-muted-foreground">{r.email || "—"}</div>
                    </TableCell>
                    <TableCell className="capitalize">{r.challenge}</TableCell>
                    <TableCell>
                      <Badge variant={r.tier === "top" ? "default" : "secondary"}>{r.tier.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.is_active ? "default" : "outline"}>
                        {r.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{fmtDate(r.started_at)}</TableCell>
                    <TableCell className="text-sm">{fmtDate(r.active_until)}</TableCell>
                    <TableCell className="text-right">{r.months_billed}</TableCell>
                    <TableCell className="text-right font-semibold">€{Number(r.total_paid_eur || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Paid amounts are estimated from the subscription tier (PRO €3/mo, TOP €5/mo) and the number of billed months.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
