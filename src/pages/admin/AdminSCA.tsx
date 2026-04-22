import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, RefreshCw, ExternalLink, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";

type Row = {
  id: string;
  email: string;
  stripe_invoice_id: string;
  amount_cents: number;
  currency: string;
  hosted_invoice_url: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
};

type KPIs = {
  pending_count: number;
  confirmed_count: number;
  abandoned_count: number;
  at_risk_cents: number;
  confirmed_cents: number;
  success_rate: number;
};

const fmtEur = (cents: number, currency = "eur") =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: currency.toUpperCase() })
    .format((cents ?? 0) / 100);

const AdminSCA = () => {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-sca");
    setLoading(false);
    if (error || (data as any)?.error) return;
    setKpis((data as any).kpis);
    setRows((data as any).rows ?? []);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Helmet>
        <title>SCA / 3DS Pending Actions — Admin</title>
        <meta name="description" content="Track Strong Customer Authentication challenges across subscriptions." />
      </Helmet>

      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-amber-500" /> SCA / 3-D Secure
          </h1>
          <p className="text-muted-foreground">Subscriber bank-authentication challenges (90 days)</p>
        </div>
        <Button onClick={load} disabled={loading} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </header>

      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="text-xs uppercase text-muted-foreground">Pending</div>
            <div className="text-3xl font-bold text-amber-500">{kpis.pending_count}</div>
            <div className="text-xs text-muted-foreground mt-1">{fmtEur(kpis.at_risk_cents)} at risk</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs uppercase text-muted-foreground">Confirmed</div>
            <div className="text-3xl font-bold text-emerald-500">{kpis.confirmed_count}</div>
            <div className="text-xs text-muted-foreground mt-1">{fmtEur(kpis.confirmed_cents)} recovered</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs uppercase text-muted-foreground">Abandoned</div>
            <div className="text-3xl font-bold text-destructive">{kpis.abandoned_count}</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs uppercase text-muted-foreground">Success rate</div>
            <div className="text-3xl font-bold">{kpis.success_rate.toFixed(1)}%</div>
          </Card>
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3">When</th>
                <th className="p-3">Email</th>
                <th className="p-3">Invoice</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/50">
                  <td className="p-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3 font-mono text-xs">{r.stripe_invoice_id}</td>
                  <td className="p-3 font-semibold">{fmtEur(r.amount_cents, r.currency)}</td>
                  <td className="p-3">
                    {r.status === "requires_action" && (
                      <Badge variant="outline" className="border-amber-500/50 text-amber-500 gap-1">
                        <AlertTriangle className="h-3 w-3" /> Pending
                      </Badge>
                    )}
                    {r.status === "confirmed" && (
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Confirmed
                      </Badge>
                    )}
                    {(r.status === "abandoned" || r.status === "expired") && (
                      <Badge variant="outline" className="border-destructive/50 text-destructive gap-1">
                        <XCircle className="h-3 w-3" /> {r.status}
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {r.hosted_invoice_url && (
                      <a href={r.hosted_invoice_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline">
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No SCA challenges in the last 90 days.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminSCA;
