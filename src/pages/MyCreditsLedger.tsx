import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Coins,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { SEO } from "@/components/SEO";

interface LedgerRow {
  id: string;
  user_id: string;
  delta: number;
  balance_before: number | null;
  balance_after: number | null;
  reason: string | null;
  source: string | null;
  metadata: any;
  created_at: string;
}

const PAGE_SIZE = 200;

// Friendly labels for known reason codes (prefix match supported via startsWith)
const REASON_LABELS: Record<string, string> = {
  manual_add: "Manual add",
  manual_deduct: "Manual deduct",
  founding_member_bonus: "Founding member bonus",
  gift_sent: "Gift sent",
  gift_received: "Gift received",
  lucky_wheel_cost: "Lucky Wheel – spin",
  lucky_wheel_prize: "Lucky Wheel – prize",
  mystery_box_purchase: "Mystery Box purchase",
  purchase: "Credit purchase",
  subscription_grant: "Subscription – credits",
  ai_generation: "AI generation",
  refund: "Credit refund",
  promo_code: "Promo code",
  referral_bonus: "Referral bonus",
  unknown_update: "Unknown change",
};

function prettyReason(reason: string | null): string {
  if (!reason) return "—";
  const base = reason.split(":")[0];
  const label = REASON_LABELS[base];
  if (!label) return reason;
  const suffix = reason.slice(base.length);
  return suffix ? `${label}${suffix}` : label;
}

export default function MyCreditsLedger() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [directionFilter, setDirectionFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      setLoading(false);
      toast.error("Musíš byť prihlásený.");
      return;
    }

    let q = (supabase as any)
      .from("ai_credits_ledger")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (reasonFilter !== "all") q = q.eq("reason", reasonFilter);
    if (dateFrom) q = q.gte("created_at", new Date(dateFrom).toISOString());
    if (dateTo) q = q.lte("created_at", new Date(dateTo + "T23:59:59").toISOString());
    if (directionFilter === "credit") q = q.gt("delta", 0);
    if (directionFilter === "debit") q = q.lt("delta", 0);

    const { data, error } = await q;
    if (error) {
      toast.error("Nepodarilo sa načítať: " + error.message);
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reasons = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => r.reason && s.add(r.reason));
    return Array.from(s).sort();
  }, [rows]);

  const stats = useMemo(() => {
    const credits = rows.filter((r) => r.delta > 0).reduce((s, r) => s + r.delta, 0);
    const debits = rows.filter((r) => r.delta < 0).reduce((s, r) => s + r.delta, 0);
    return { credits, debits, net: credits + debits, count: rows.length };
  }, [rows]);

  const exportCsv = () => {
    const headers = [
      "created_at",
      "delta",
      "balance_before",
      "balance_after",
      "reason",
      "source",
    ];
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        [
          r.created_at,
          r.delta,
          r.balance_before ?? "",
          r.balance_after ?? "",
          r.reason ?? "",
          r.source ?? "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moje_kredity_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEO
        title="História kreditov | Unique"
        description="Prehľad všetkých pohybov AI kreditov s dôvodom každej transakcie."
      />

      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Späť
          </Button>
        </div>

        <header className="mb-6 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/15 p-3">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">História kreditov</h1>
              <p className="text-sm text-muted-foreground">
                Všetky pohyby tvojich AI kreditov s dôvodom každej transakcie.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/lucky-wheel")}>
              🎡 Koleso šťastia
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/credit-gifts")}>
              🎁 Poslať darček
            </Button>
          </div>
        </header>

        <Card className="p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Dôvod</label>
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky</SelectItem>
                  {reasons.map((r) => (
                    <SelectItem key={r} value={r}>
                      {prettyReason(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Smer</label>
              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky</SelectItem>
                  <SelectItem value="credit">Príjmy (+)</SelectItem>
                  <SelectItem value="debit">Výdaje (−)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Od</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Do</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Použiť filtre
            </Button>
            <Button variant="outline" onClick={exportCsv} disabled={!rows.length}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Záznamy</div>
            <div className="text-2xl font-bold">{stats.count}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" /> Príjmy
            </div>
            <div className="text-2xl font-bold text-green-500">+{stats.credits}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-500" /> Výdaje
            </div>
            <div className="text-2xl font-bold text-red-500">{stats.debits}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Netto</div>
            <div
              className={`text-2xl font-bold ${
                stats.net >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {stats.net >= 0 ? "+" : ""}
              {stats.net}
            </div>
          </Card>
        </div>

        {/* Desktop table */}
        <Card className="p-0 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Kedy</th>
                  <th className="text-right p-3">Δ</th>
                  <th className="text-right p-3">Pred</th>
                  <th className="text-right p-3">Po</th>
                  <th className="text-left p-3">Dôvod</th>
                  <th className="text-left p-3">Zdroj</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      Načítavam…
                    </td>
                  </tr>
                )}
                {!loading && !rows.length && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      Žiadne pohyby pre tieto filtre.
                    </td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="p-3 whitespace-nowrap text-xs">
                      {format(new Date(r.created_at), "yyyy-MM-dd HH:mm")}
                    </td>
                    <td
                      className={`p-3 text-right font-bold ${
                        r.delta > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {r.delta > 0 ? "+" : ""}
                      {r.delta}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      {r.balance_before ?? "—"}
                    </td>
                    <td className="p-3 text-right">{r.balance_after ?? "—"}</td>
                    <td className="p-3">
                      <Badge
                        variant={r.reason === "unknown_update" ? "destructive" : "secondary"}
                      >
                        {prettyReason(r.reason)}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{r.source ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === PAGE_SIZE && (
            <div className="p-3 text-center text-xs text-muted-foreground border-t border-border/40">
              Zobrazujem prvých {PAGE_SIZE} záznamov. Použi filtre pre zúženie.
            </div>
          )}
        </Card>

        {/* Mobile list */}
        <div className="md:hidden space-y-2">
          {loading && (
            <Card className="p-6 text-center text-muted-foreground text-sm">Načítavam…</Card>
          )}
          {!loading && !rows.length && (
            <Card className="p-6 text-center text-muted-foreground text-sm">
              Žiadne pohyby pre tieto filtre.
            </Card>
          )}
          {rows.map((r) => (
            <Card key={r.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(r.created_at), "yyyy-MM-dd HH:mm")}
                  </div>
                  <div className="mt-1">
                    <Badge
                      variant={r.reason === "unknown_update" ? "destructive" : "secondary"}
                      className="text-[11px]"
                    >
                      {prettyReason(r.reason)}
                    </Badge>
                  </div>
                  {r.source && (
                    <div className="text-[11px] text-muted-foreground mt-1">
                      Zdroj: {r.source}
                    </div>
                  )}
                </div>
                <div
                  className={`text-lg font-bold shrink-0 ${
                    r.delta > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {r.delta > 0 ? "+" : ""}
                  {r.delta}
                </div>
              </div>
              {(r.balance_before !== null || r.balance_after !== null) && (
                <div className="mt-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex justify-between">
                  <span>Pred: {r.balance_before ?? "—"}</span>
                  <span>Po: {r.balance_after ?? "—"}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
