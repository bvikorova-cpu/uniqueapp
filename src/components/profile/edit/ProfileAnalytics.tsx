import { useEffect, useState } from "react";
import { BarChart3, Eye, Globe2, Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props {
  userId: string;
}

interface ViewRow {
  created_at: string;
  viewer_country: string | null;
  source: string | null;
}

export const ProfileAnalytics = ({ userId }: Props) => {
  const [rows, setRows] = useState<ViewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("profile_views")
        .select("created_at, viewer_country, source")
        .eq("profile_id", userId)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(500);
      setRows((data as ViewRow[]) || []);
      setLoading(false);
    })();
  }, [userId]);

  const total = rows.length;
  const last7 = rows.filter((r) => new Date(r.created_at) > new Date(Date.now() - 7 * 86400000)).length;
  const last24 = rows.filter((r) => new Date(r.created_at) > new Date(Date.now() - 86400000)).length;

  const topCountries = Object.entries(
    rows.reduce((acc: Record<string, number>, r) => {
      const c = r.viewer_country || "Unknown";
      acc[c] = (acc[c] || 0) + 1; return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const topSources = Object.entries(
    rows.reduce((acc: Record<string, number>, r) => {
      const s = r.source || "direct";
      acc[s] = (acc[s] || 0) + 1; return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // 7-day sparkline
  const days: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const count = rows.filter((r) => r.created_at.slice(0, 10) === key).length;
    days.push({ day: d.toLocaleDateString(undefined, { weekday: "short" }), count });
  }
  const max = Math.max(1, ...days.map((d) => d.count));

  return (
    <>
      <FloatingHowItWorks title={"Profile Analytics - How it works"} steps={[{ title: 'Open', desc: 'Access the Profile Analytics section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Profile Analytics.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-cyan-400" />
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Profile Analytics</p>
          <p className="text-base font-black bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
            Last 30 days
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Stat label="Total" value={total || "—"} icon={Eye} />
            <Stat label="Last 7d" value={last7 || "—"} icon={TrendingUp} />
            <Stat label="Last 24h" value={last24 || "—"} icon={TrendingUp} />
          </div>

          {/* sparkline */}
          <div className="mb-5">
            <p className="text-xs font-bold mb-2 text-muted-foreground">Views — last 7 days</p>
            <div className="flex items-end gap-1.5 h-20">
              {days.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-cyan-500 to-sky-300"
                    style={{ height: `${(d.count / max) * 100}%`, minHeight: 2 }}
                    title={`${d.count} views`}
                  />
                  <span className="text-[9px] text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold mb-2 flex items-center gap-1.5 text-muted-foreground">
                <Globe2 className="h-3 w-3" /> Top countries
              </p>
              {topCountries.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No data yet — share your profile.</p>
              ) : (
                <div className="space-y-1.5">
                  {topCountries.map(([c, n]) => (
                    <div key={c} className="flex items-center justify-between text-xs">
                      <span>{c}</span>
                      <span className="text-muted-foreground tabular-nums">{n}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold mb-2 text-muted-foreground">Top sources</p>
              {topSources.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No data yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {topSources.map(([s, n]) => (
                    <div key={s} className="flex items-center justify-between text-xs">
                      <span className="truncate">{s}</span>
                      <span className="text-muted-foreground tabular-nums">{n}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
    </>
  );
};

const Stat = ({ label, value, icon: Icon }: { label: string; value: number | string; icon: React.ElementType }) => (
  <div className="rounded-xl border border-border/40 bg-muted/20 p-3 text-center">
    <Icon className="h-4 w-4 mx-auto text-cyan-400 mb-1" />
    <p className="text-xl font-black tabular-nums">{value}</p>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</p>
  </div>
);
