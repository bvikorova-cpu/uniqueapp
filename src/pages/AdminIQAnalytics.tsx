import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { trackIQEvent } from "@/lib/iqAnalytics";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const FUNNEL_ORDER = [
  "iq_view",
  "iq_test_start",
  "iq_test_complete",
  "iq_credits_purchase",
];

export default function AdminIQAnalytics() {
  useEffect(() => { trackIQEvent("admin_iq_analytics_view"); }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["iq-funnel"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_iq_funnel");
      if (error) throw error;
      return (data ?? []) as Array<{ event_name: string; total: number; unique_users: number }>;
    },
  });

  const map = new Map<string, { total: number; uniq: number }>();
  (data ?? []).forEach((r) => map.set(r.event_name, { total: Number(r.total), uniq: Number(r.unique_users) }));
  const peak = Math.max(1, ...FUNNEL_ORDER.map((e) => map.get(e)?.uniq ?? 0));

  const others = (data ?? []).filter((r) => !FUNNEL_ORDER.includes(r.event_name));

  return (
    <>
      <FloatingHowItWorks title="How Admin IQAnalytics works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
      <AdminGuard>
      <div className="container mx-auto p-4 md:p-6 space-y-6 mt-16">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            📊 IQ Analytics & Funnel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Last 30 days</p>
        </div>

        <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
          <CardHeader><CardTitle className="text-base">Conversion Funnel</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {FUNNEL_ORDER.map((evt, i) => {
              const stat = map.get(evt) ?? { total: 0, uniq: 0 };
              const pct = (stat.uniq / peak) * 100;
              const prev = i > 0 ? map.get(FUNNEL_ORDER[i - 1])?.uniq ?? 0 : null;
              const conv = prev && prev > 0 ? ((stat.uniq / prev) * 100).toFixed(1) : null;
              return (
                <div key={evt}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-mono text-xs">{evt}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline">{stat.uniq} users</Badge>
                      <Badge variant="secondary">{stat.total} events</Badge>
                      {conv && <Badge className="bg-gradient-to-r from-primary to-accent border-0">{conv}%</Badge>}
                    </div>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
            {!isLoading && !data?.length && (
              <p className="text-xs text-muted-foreground text-center py-6">No events recorded yet</p>
            )}
          </CardContent>
        </Card>

        {others.length > 0 && (
          <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
            <CardHeader><CardTitle className="text-base">Other Events</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-2">
                {others.map((r) => (
                  <div key={r.event_name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
                    <span className="font-mono text-xs">{r.event_name}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline">{r.unique_users}u</Badge>
                      <Badge variant="secondary">{r.total}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminGuard>
    </>
    );
}
