import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Award, Crown, Gem, Medal } from "lucide-react";
import { Helmet } from "react-helmet-async";

const TIER_ICONS: Record<string, typeof Award> = {
  bronze: Medal,
  silver: Award,
  gold: Crown,
  diamond: Gem,
};

const TIER_COLORS: Record<string, string> = {
  bronze: "text-amber-700",
  silver: "text-slate-300",
  gold: "text-yellow-400",
  diamond: "text-cyan-300",
};

export default function AdminAffiliateTiers() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.functions.invoke("admin-affiliate-tiers");
      if (!error) setData(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 border-destructive/40">
          <div className="text-destructive font-semibold">Access denied</div>
          <div className="text-sm text-muted-foreground mt-1">
            {data?.error ?? "Failed to load affiliate tiers"}
          </div>
        </Card>
      </div>
    );
  }

  const { config, status, counts } = data;

  return (
    <>
      <Helmet>
        <title>Affiliate Tiers — Admin</title>
        <meta name="description" content="Admin overview of affiliate tier program performance." />
      </Helmet>
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Tiers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Multi-tier referrer rewards. Updates automatically as referrers earn.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {config.map((c: any) => {
            const Icon = TIER_ICONS[c.tier];
            const color = TIER_COLORS[c.tier];
            return (
              <Card key={c.tier} className="p-4 bg-card/50 backdrop-blur">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <span className="font-semibold">{c.label}</span>
                </div>
                <div className="text-2xl font-bold">{counts[c.tier] ?? 0}</div>
                <div className="text-xs text-muted-foreground">members</div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <Badge variant="secondary" className="font-mono">
                    €{Number(c.reward_eur).toFixed(2)}/ref
                  </Badge>
                  <span className="text-muted-foreground">≥{c.min_referrals} refs</span>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50">
            <h2 className="font-semibold">Top affiliates</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2">User</th>
                  <th className="text-left px-4 py-2">Tier</th>
                  <th className="text-right px-4 py-2">Referrals</th>
                  <th className="text-right px-4 py-2">Lifetime €</th>
                  <th className="text-left px-4 py-2">Promoted</th>
                </tr>
              </thead>
              <tbody>
                {(status ?? []).map((r: any) => {
                  const Icon = TIER_ICONS[r.tier];
                  const color = TIER_COLORS[r.tier];
                  return (
                    <tr key={r.user_id} className="border-t border-border/30">
                      <td className="px-4 py-2 font-mono text-xs">{r.user_id.slice(0, 8)}…</td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon className={`h-4 w-4 ${color}`} />
                          {r.tier}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">{r.approved_referrals}</td>
                      <td className="px-4 py-2 text-right font-mono">
                        €{Number(r.lifetime_earnings_eur).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">
                        {r.promoted_at ? new Date(r.promoted_at).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  );
                })}
                {!status?.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No affiliate activity yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
