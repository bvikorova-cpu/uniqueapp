import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, RefreshCcw, Loader2, Copy, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Row {
  id: string;
  email: string;
  user_id: string;
  status: string;
  offer_percent_off: number;
  offer_duration_months: number;
  offer_token: string;
  offer_expires_at: string;
  cancelled_at: string;
  claimed_at: string | null;
  last_amount_cents: number | null;
  currency: string;
}

interface Kpis {
  total_90d: number;
  claimed_90d: number;
  claim_rate: number;
}

const statusVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "claimed") return "default";
  if (s === "expired" || s === "dismissed") return "destructive";
  return "secondary";
};

const AdminWinBack = () => {
  const { format } = useCurrency();
  const [rows, setRows] = useState<Row[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-winback", { body: {} });
    setLoading(false);
    if (error) {
      toast.error("Failed to load");
      return;
    }
    setRows((data as any).rows ?? []);
    setKpis((data as any).kpis ?? null);
  };

  useEffect(() => { load(); }, []);

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/winback/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  const filtered = rows.filter((r) =>
    !search || r.email.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search),
  );

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Heart className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Win-back Campaigns</h1>
              <p className="text-muted-foreground text-sm">Recover cancelled subscribers with one-time offers.</p>
            </div>
          </div>
          <Button onClick={load} disabled={loading} variant="outline" className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>

        {kpis && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5">
              <div className="text-xs uppercase text-muted-foreground tracking-wider">Sent (90d)</div>
              <div className="text-3xl font-bold mt-1">{kpis.total_90d}</div>
            </Card>
            <Card className="p-5">
              <div className="text-xs uppercase text-muted-foreground tracking-wider">Claimed (90d)</div>
              <div className="text-3xl font-bold mt-1 text-emerald-500">{kpis.claimed_90d}</div>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
              <div className="text-xs uppercase text-muted-foreground tracking-wider">Claim rate</div>
              <div className="text-3xl font-bold mt-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {(kpis.claim_rate * 100).toFixed(1)}%
              </div>
            </Card>
          </div>
        )}

        <Card className="p-4">
          <div className="relative mb-4">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email or campaign ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 px-2">Email</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Offer</th>
                  <th className="py-2 px-2">Last €</th>
                  <th className="py-2 px-2">Cancelled</th>
                  <th className="py-2 px-2">Expires</th>
                  <th className="py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-2 font-mono text-xs">{r.email}</td>
                    <td className="py-2 px-2"><Badge variant={statusVariant(r.status)}>{r.status}</Badge></td>
                    <td className="py-2 px-2">{r.offer_percent_off}% × {r.offer_duration_months}mo</td>
                    <td className="py-2 px-2">{r.last_amount_cents ? format(r.last_amount_cents / 100) : "—"}</td>
                    <td className="py-2 px-2 text-xs text-muted-foreground">{new Date(r.cancelled_at).toLocaleDateString()}</td>
                    <td className="py-2 px-2 text-xs text-muted-foreground">{new Date(r.offer_expires_at).toLocaleDateString()}</td>
                    <td className="py-2 px-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => copyLink(r.offer_token)} title="Copy link">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" asChild title="Open">
                          <a href={`/winback/${r.offer_token}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No campaigns yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminWinBack;
