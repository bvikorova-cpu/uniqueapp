import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ChefHat, Mic2, Trophy, Users, Heart, Music, Building2, Briefcase,
  Sparkles, Camera, Gamepad2, BookOpen, Image as ImageIcon, Wallet, TrendingUp
} from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Hub {
  key: string;
  label: string;
  icon: any;
  color: string;
  table?: string;
  path: string;
}

const HUBS: Hub[] = [
  { key: "chef", label: "KitchenStars", icon: ChefHat, color: "from-orange-500 to-red-500", table: "masterchef_chefs", path: "/admin/masterchef-payouts" },
  { key: "comedy", label: "Comedy", icon: Mic2, color: "from-purple-500 to-pink-500", table: "comedians", path: "/admin/comedy-payouts" },
  { key: "sports", label: "Sports Tipsters", icon: Trophy, color: "from-emerald-500 to-teal-500", table: "sports_tipsters", path: "/admin/tipsters" },
  { key: "influ", label: "InfluKing", icon: Users, color: "from-fuchsia-500 to-purple-500", table: "instructor_profiles", path: "/admin/influencer-payouts" },
  { key: "music", label: "Musicians", icon: Music, color: "from-indigo-500 to-blue-500", table: "musician_profiles", path: "/admin/campaign-withdrawals" },
  { key: "fund", label: "Fundraising", icon: Heart, color: "from-rose-500 to-pink-500", table: "fundraising_campaigns", path: "/admin/campaign-withdrawals" },
  { key: "auc", label: "Auctions", icon: Sparkles, color: "from-amber-500 to-yellow-500", table: "auctions", path: "/admin/campaign-withdrawals" },
  { key: "corp", label: "Corporate", icon: Building2, color: "from-slate-500 to-zinc-600", table: "corporate_inquiries", path: "/admin/corporate-inquiries" },
  { key: "brand", label: "Brand Camp.", icon: Briefcase, color: "from-cyan-500 to-blue-500", table: "brand_campaigns", path: "/admin/brand-campaigns" },
  { key: "tx", label: "Transactions", icon: Wallet, color: "from-green-500 to-emerald-600", table: "transactions", path: "/admin/transactions" },
  { key: "earn", label: "Earnings", icon: TrendingUp, color: "from-violet-500 to-purple-600", path: "/admin/platform-earnings" },
  { key: "img", label: "AI Image", icon: ImageIcon, color: "from-pink-500 to-rose-500", path: "/admin/image-editor" },
];

export const HubPerformanceMatrix = () => {
  const nav = useNavigate();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [deltas, setDeltas] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const result: Record<string, number> = {};
      await Promise.all(
        HUBS.filter((h) => h.table).map(async (h) => {
          try {
            const { count } = await (supabase as any)
              .from(h.table)
              .select("*", { count: "exact", head: true });
            result[h.key] = count || 0;
          } catch {
            result[h.key] = 0;
          }
        }),
      );
      if (!cancelled) {
        setCounts(result);
        setLoading(false);
      }
    };
    load();
    const refresh = setInterval(load, 60_000);

    // Realtime delta indicators on tracked tables
    const channels = HUBS.filter((h) => h.table).map((h) =>
      (supabase as any)
        .channel(`hub-${h.key}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: h.table }, () => {
          setCounts((c) => ({ ...c, [h.key]: (c[h.key] || 0) + 1 }));
          setDeltas((d) => ({ ...d, [h.key]: (d[h.key] || 0) + 1 }));
          setTimeout(() => {
            setDeltas((d) => {
              const n = { ...d };
              n[h.key] = Math.max(0, (n[h.key] || 1) - 1);
              if (n[h.key] === 0) delete n[h.key];
              return n;
            });
          }, 4000);
        })
        .subscribe(),
    );

    return () => {
      cancelled = true;
      clearInterval(refresh);
      channels.forEach((c: any) => supabase.removeChannel(c));
    };
  }, []);

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card/70 via-card/50 to-primary/5 backdrop-blur-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/15 border border-primary/30">
            <Gamepad2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Hub Performance Matrix</h3>
            <p className="text-xs text-muted-foreground">Health & volume across all verticals</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {HUBS.map((h) => {
          const v = counts[h.key];
          const delta = deltas[h.key] || 0;
          const healthy = v === undefined ? null : v > 0;
          return (
            <button
              key={h.key}
              onClick={() => nav(h.path)}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/40 hover:bg-card/70 hover:border-primary/40 transition-all p-3 text-left"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${h.color} transition-opacity`} />
              {delta > 0 && (
                <div className="absolute inset-0 bg-emerald-400/10 animate-pulse pointer-events-none" />
              )}
              <div className="relative flex items-start justify-between mb-2">
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${h.color}`}>
                  <h.icon className="h-3.5 w-3.5 text-white" />
                </div>
                {healthy !== null && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      healthy ? "bg-emerald-400 shadow-[0_0_8px_hsl(150_90%_60%)]" : "bg-slate-500"
                    }`}
                  />
                )}
              </div>
              <div className="relative">
                <div className="text-[11px] font-medium truncate flex items-center gap-1">
                  {h.label}
                  {delta > 0 && (
                    <span className="text-[9px] px-1 rounded bg-emerald-500/30 text-emerald-200 font-bold">
                      +{delta}
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold">
                  {loading ? <span className="opacity-30">···</span> : (v ?? "—")}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
