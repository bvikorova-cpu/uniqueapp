import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Crown, Flame, TrendingUp } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Mode = "earners" | "spenders" | "active";
type Range = "24h" | "7d" | "30d" | "all";

const RANGE_MS: Record<Range, number | null> = {
  "24h": 86_400_000,
  "7d": 7 * 86_400_000,
  "30d": 30 * 86_400_000,
  "all": null,
};

interface Row {
  user_id: string;
  name: string;
  email?: string;
  value: number;
  avatar?: string | null;
}

const MODE_LABEL: Record<Mode, string> = {
  earners: "Top Earners",
  spenders: "Top Spenders",
  active: "Most Active",
};

const MODE_ICON: Record<Mode, any> = {
  earners: Crown,
  spenders: Flame,
  active: TrendingUp,
};

export const TopUsersLeaderboard = () => {
  const [mode, setMode] = useState<Mode>("earners");
  const [range, setRange] = useState<Range>("7d");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    const sinceIso = RANGE_MS[range]
      ? new Date(Date.now() - (RANGE_MS[range] as number)).toISOString()
      : null;

    const load = async () => {
      setLoading(true);
      try {
        if (mode === "earners") {
          let q = supabase
            .from("transactions")
            .select("seller_id, amount, created_at")
            .not("seller_id", "is", null)
            .limit(1000);
          if (sinceIso) q = q.gte("created_at", sinceIso);
          const { data } = await q;
          const agg = new Map<string, number>();
          (data || []).forEach((t: any) => {
            agg.set(t.seller_id, (agg.get(t.seller_id) || 0) + Number(t.amount || 0));
          });
          await hydrate(agg);
        } else if (mode === "spenders") {
          let q = supabase
            .from("transactions")
            .select("buyer_id, amount, created_at")
            .not("buyer_id", "is", null)
            .limit(1000);
          if (sinceIso) q = q.gte("created_at", sinceIso);
          const { data } = await q;
          const agg = new Map<string, number>();
          (data || []).forEach((t: any) => {
            agg.set(t.buyer_id, (agg.get(t.buyer_id) || 0) + Number(t.amount || 0));
          });
          await hydrate(agg);
        } else {
          const fallbackSince = sinceIso || new Date(Date.now() - 7 * 86400_000).toISOString();
          const { data } = await supabase
            .from("activity_logs")
            .select("user_id")
            .gte("created_at", fallbackSince)
            .limit(2000);
          const agg = new Map<string, number>();
          (data || []).forEach((t: any) => {
            agg.set(t.user_id, (agg.get(t.user_id) || 0) + 1);
          });
          await hydrate(agg);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancel) setLoading(false);
      }
    };

    const hydrate = async (agg: Map<string, number>) => {
      const top = [...agg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7);
      const ids = top.map(([id]) => id);
      if (ids.length === 0) {
        setRows([]);
        return;
      }
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", ids);
      const byId = new Map<string, any>((profiles || []).map((p: any) => [p.id, p]));
      if (cancel) return;
      setRows(
        top.map(([id, v]) => ({
          user_id: id,
          name: byId.get(id)?.full_name || "Unknown",
          email: byId.get(id)?.email,
          avatar: byId.get(id)?.avatar_url,
          value: v,
        })),
      );
    };

    load();
    return (
    <>
      <FloatingHowItWorks title={"Top Users Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Top Users Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Top Users Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => {
      cancel = true;
    };
  }, [mode, range]);

  const Icon = MODE_ICON[mode];
  const formatValue = (v: number) => (mode === "active" ? `${v} actions` : `€${v.toFixed(2)}`);
  const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`);

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-card/60 to-orange-500/5 backdrop-blur-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
            <Trophy className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-semibold text-base">{MODE_LABEL[mode]}</h3>
            <p className="text-xs text-muted-foreground">Live leaderboard</p>
          </div>
        </div>
        <div className="flex gap-1">
          {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2 py-1 text-[10px] rounded-md border transition ${
                mode === m
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-900 dark:text-amber-200"
                  : "bg-card/40 border-border text-muted-foreground hover:bg-card/60"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Range picker */}
      <div className="flex gap-1 mb-3">
        {(Object.keys(RANGE_MS) as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`flex-1 px-2 py-1 text-[10px] rounded-md border transition ${
              range === r
                ? "bg-orange-500/20 border-orange-500/50 text-orange-900 dark:text-orange-200"
                : "bg-card/40 border-border text-muted-foreground hover:bg-card/60"
            }`}
          >
            {r === "all" ? "ALL" : r.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
        {loading && <div className="text-center text-xs text-muted-foreground py-6">Loading…</div>}
        {!loading && rows.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-6">No data yet</div>
        )}
        {rows.map((r, i) => (
          <div
            key={r.user_id}
            className={`flex items-center gap-3 p-2 rounded-lg border ${
              i < 3 ? "border-amber-500/30 bg-amber-500/5" : "border-border/40 bg-card/30"
            }`}
          >
            <span className="w-7 text-center text-sm font-bold">{medal(i)}</span>
            {r.avatar ? (
              <img src={r.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                {r.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{r.name}</div>
              <div className="text-[10px] text-muted-foreground truncate">{r.email}</div>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-amber-300">
              <Icon className="h-3.5 w-3.5" />
              {formatValue(r.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
