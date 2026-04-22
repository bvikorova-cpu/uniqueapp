import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pause, Users, AlertOctagon } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function AdminPauseOverview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.functions.invoke("admin-pause-overview");
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
            {data?.error ?? "Failed to load pause overview"}
          </div>
        </Card>
      </div>
    );
  }

  const { config, kpis, topUsers, recent } = data;

  return (
    <>
      <Helmet>
        <title>Pause Overview — Admin</title>
        <meta name="description" content="Subscription pause analytics and abuse detection." />
      </Helmet>
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Subscription Pauses</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Last 12 months · Limit: {config?.max_pauses_per_year ?? 3} pauses/year ·{" "}
            {config?.max_months_per_pause ?? 3} months max per pause
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Pause className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total pauses</span>
            </div>
            <div className="text-2xl font-bold">{kpis.totalPauses}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Unique users</span>
            </div>
            <div className="text-2xl font-bold">{kpis.uniqueUsers}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertOctagon className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">At limit</span>
            </div>
            <div className="text-2xl font-bold">{kpis.atLimit}</div>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50">
            <h2 className="font-semibold">Top pausers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2">User</th>
                  <th className="text-right px-4 py-2">Pauses (12mo)</th>
                  <th className="text-left px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u: any) => (
                  <tr key={u.user_id} className="border-t border-border/30">
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2 text-right font-semibold">{u.count}</td>
                    <td className="px-4 py-2">
                      {u.count >= (config?.max_pauses_per_year ?? 3) ? (
                        <Badge variant="destructive">At limit</Badge>
                      ) : (
                        <Badge variant="secondary">OK</Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {!topUsers.length && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                      No pauses recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50">
            <h2 className="font-semibold">Recent pauses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2">When</th>
                  <th className="text-left px-4 py-2">User</th>
                  <th className="text-right px-4 py-2">Months</th>
                  <th className="text-left px-4 py-2">Resumes</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r: any, i: number) => (
                  <tr key={i} className="border-t border-border/30">
                    <td className="px-4 py-2 text-xs">
                      {new Date(r.paused_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{r.user_email}</td>
                    <td className="px-4 py-2 text-right">{r.months}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {r.resumes_at ? new Date(r.resumes_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
