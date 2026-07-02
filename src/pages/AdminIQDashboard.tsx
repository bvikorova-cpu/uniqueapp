import { useQuery } from "@tanstack/react-query";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Users, Trophy, Coins, Zap, Target, Flame, Bell } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
function StatCard({ icon: Icon, label, value, hint }: any) {
  return (
    <>
      <FloatingHowItWorks title="How Admin IQDashboard works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-black mt-1">{value ?? "—"}</p>
            {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
          </div>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
    </>
    );
}

export default function AdminIQDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-iq-dashboard"],
    queryFn: async () => {
      const tables = [
        "iq_user_stats",
        "iq_test_results",
        "iq_credits",
        "iq_user_badges",
        "iq_notifications",
        "iq_promo_codes",
        "iq_promo_redemptions",
        "iq_daily_streaks",
      ] as const;

      const counts: Record<string, number> = {};
      await Promise.all(
        tables.map(async (t) => {
          const { count } = await supabase.from(t as any).select("*", { count: "exact", head: true });
          counts[t] = count ?? 0;
        }),
      );

      const { data: topIq } = await supabase
        .from("iq_user_stats")
        .select("user_id, best_iq, total_tests, longest_streak")
        .order("best_iq", { ascending: false })
        .limit(10);

      const { data: recentTests } = await supabase
        .from("iq_test_results")
        .select("user_id, iq_score, category, completed_at")
        .order("completed_at", { ascending: false })
        .limit(10);

      const { data: promos } = await supabase
        .from("iq_promo_codes")
        .select("code, credits, redemption_count, max_redemptions, is_active, expires_at")
        .order("created_at", { ascending: false })
        .limit(10);

      return { counts, topIq: topIq ?? [], recentTests: recentTests ?? [], promos: promos ?? [] };
    },
  });

  return (
    <AdminGuard>
      <div className="container mx-auto p-4 md:p-6 space-y-6 mt-16">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            🧠 IQ Platform — Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time IQ ecosystem metrics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={Users}    label="Players"        value={data?.counts.iq_user_stats}      />
          <StatCard icon={Brain}    label="Tests Taken"    value={data?.counts.iq_test_results}    />
          <StatCard icon={Coins}    label="Credit Wallets" value={data?.counts.iq_credits}         />
          <StatCard icon={Trophy}   label="Badges Issued"  value={data?.counts.iq_user_badges}     />
          <StatCard icon={Bell}     label="Notifications"  value={data?.counts.iq_notifications}   />
          <StatCard icon={Target}   label="Promo Codes"    value={data?.counts.iq_promo_codes}     />
          <StatCard icon={Zap}      label="Promo Redeems"  value={data?.counts.iq_promo_redemptions}/>
          <StatCard icon={Flame}    label="Daily Streaks"  value={data?.counts.iq_daily_streaks}   />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
            <CardHeader><CardTitle className="text-base">🏆 Top 10 IQ</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(data?.topIq ?? []).map((r: any, i: number) => (
                <div key={r.user_id} className="flex items-center justify-between text-sm border-b border-border/30 pb-1.5 last:border-0">
                  <span className="font-mono text-xs text-muted-foreground">#{i + 1} {r.user_id.slice(0, 8)}…</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">IQ {r.best_iq}</Badge>
                    <Badge variant="secondary">{r.total_tests} tests</Badge>
                  </div>
                </div>
              ))}
              {!isLoading && !data?.topIq.length && <p className="text-xs text-muted-foreground">No data</p>}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
            <CardHeader><CardTitle className="text-base">⏱️ Recent Tests</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(data?.recentTests ?? []).map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm border-b border-border/30 pb-1.5 last:border-0">
                  <span className="font-mono text-xs text-muted-foreground">{r.user_id.slice(0, 8)}…</span>
                  <div className="flex gap-2 items-center">
                    <Badge>{r.iq_score}</Badge>
                    <span className="text-[10px] text-muted-foreground">{r.category}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-card/80 border-primary/20 lg:col-span-2">
            <CardHeader><CardTitle className="text-base">🎟️ Active Promo Codes</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr className="border-b border-border/40">
                      <th className="text-left py-2">Code</th>
                      <th className="text-left">Credits</th>
                      <th className="text-left">Redeemed</th>
                      <th className="text-left">Active</th>
                      <th className="text-left">Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.promos ?? []).map((p: any) => (
                      <tr key={p.code} className="border-b border-border/20">
                        <td className="py-2 font-mono">{p.code}</td>
                        <td>{p.credits}</td>
                        <td>{p.redemption_count}/{p.max_redemptions ?? "∞"}</td>
                        <td>{p.is_active ? "✓" : "✗"}</td>
                        <td className="text-xs text-muted-foreground">
                          {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                    {!isLoading && !data?.promos.length && (
                      <tr><td colSpan={5} className="py-3 text-center text-xs text-muted-foreground">No promo codes</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}
