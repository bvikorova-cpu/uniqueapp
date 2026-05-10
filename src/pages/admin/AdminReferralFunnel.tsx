import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, MousePointerClick, UserPlus, CreditCard, Banknote, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface FunnelData {
  period: string;
  clicks: number;
  signups: number;
  paid: number;
  approved: number;
  payout_total: number;
  click_to_signup_pct: number;
  signup_to_paid_pct: number;
  click_to_paid_pct: number;
  top_codes: { code: string; clicks: number }[];
}

export default function AdminReferralFunnel() {
  const [period, setPeriod] = useState<"week" | "month" | "all_time">("month");
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: res, error } = await supabase.rpc("get_referral_funnel" as any, { _period: period });
    if (error) toast.error(error.message);
    else setData(res as unknown as FunnelData);
    setLoading(false);
  };

  useEffect(() => { load(); }, [period]);

  const Stat = ({ icon: Icon, label, value, sub }: any) => (
    <AdminGlassCard className="p-5">
      <div className="flex items-start justify-between mb-2">
        <Icon className="h-5 w-5 text-primary" />
        {sub && <Badge variant="secondary" className="text-[10px]">{sub}</Badge>}
      </div>
      <div className="text-3xl font-black">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </AdminGlassCard>
  );

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Referral Conversion Funnel"
          subtitle="Track clicks → signups → paid → payouts. Find where users drop off."
        />

        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="mb-6">
          <TabsList>
            <TabsTrigger value="week">Last 7 days</TabsTrigger>
            <TabsTrigger value="month">Last 30 days</TabsTrigger>
            <TabsTrigger value="all_time">All time</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading || !data ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Funnel stages */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat icon={MousePointerClick} label="Clicks on referral link" value={data.clicks} />
              <Stat
                icon={UserPlus}
                label="Signups attributed"
                value={data.signups}
                sub={`${data.click_to_signup_pct}%`}
              />
              <Stat
                icon={CreditCard}
                label="Paid (rewarded)"
                value={data.paid}
                sub={`${data.signup_to_paid_pct}%`}
              />
              <Stat
                icon={Banknote}
                label="Total paid out"
                value={`€${Number(data.payout_total).toFixed(2)}`}
              />
            </div>

            {/* Overall conversion */}
            <AdminGlassCard className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold">End-to-end conversion</h3>
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {data.click_to_paid_pct}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Of {data.clicks.toLocaleString()} link clicks, {data.paid.toLocaleString()} became paying customers.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Approved by fraud filter: <span className="text-foreground font-semibold">{data.approved}</span>
              </p>
            </AdminGlassCard>

            {/* Top codes */}
            <AdminGlassCard className="p-6">
              <h3 className="font-bold mb-4">Top 10 referral codes by clicks</h3>
              {data.top_codes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No clicks recorded yet for this period.</p>
              ) : (
                <div className="space-y-2">
                  {data.top_codes.map((c, i) => (
                    <div key={c.code} className="flex items-center justify-between p-2.5 rounded-lg bg-background/40 border border-border/40">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground w-6">#{i + 1}</span>
                        <span className="font-mono text-sm">{c.code}</span>
                      </div>
                      <span className="font-bold">{c.clicks}</span>
                    </div>
                  ))}
                </div>
              )}
            </AdminGlassCard>
          </div>
        )}
      </AdminPageShell>
    </AdminGuard>
  );
}
