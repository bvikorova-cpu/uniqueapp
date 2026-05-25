import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CreatorLeaderboardViewProps {
  onBack: () => void;
}

interface Creator {
  rank: number;
  creator_id: string;
  name: string;
  avatar: string;
  revenue: number;
  downloads: number;
  assets: number;
  badge: "Diamond" | "Platinum" | "Gold" | "Silver" | "Bronze";
}

const AVATARS = ["🎨", "📸", "🖌️", "✨", "📷", "🎭", "🌅", "🎬", "🖼️", "🎪"];

const badgeFor = (revenue: number): Creator["badge"] => {
  if (revenue >= 10000) return "Diamond";
  if (revenue >= 5000) return "Platinum";
  if (revenue >= 2000) return "Gold";
  if (revenue >= 500) return "Silver";
  return "Bronze";
};

const getRankStyle = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
  if (rank === 2) return "bg-gradient-to-r from-slate-300/20 to-gray-400/20 border-slate-400/30";
  if (rank === 3) return "bg-gradient-to-r from-amber-700/20 to-orange-800/20 border-amber-700/30";
  return "";
};

const getBadgeColor = (badge: string) => {
  switch (badge) {
    case "Diamond": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    case "Platinum": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "Gold": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "Silver": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    default: return "bg-amber-700/10 text-amber-600 border-amber-700/20";
  }
};

export function CreatorLeaderboardView({ onBack }: CreatorLeaderboardViewProps) {
  const [period, setPeriod] = useState("alltime");
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("stock_creator_earnings")
        .select("creator_id, total_earnings")
        .order("total_earnings", { ascending: false })
        .limit(10);

      const ids = (data || []).map((r: any) => r.creator_id);
      const sb: any = supabase;
      const profsRes: any = ids.length
        ? await (sb as any).from("profiles_public").select("id, full_name").in("id", ids)
        : { data: [] };
      const itemsRes: any = ids.length
        ? await sb.from("stock_content_items").select("creator_id").in("creator_id", ids)
        : { data: [] };
      const dlRes: any = ids.length
        ? await sb.from("stock_content_sales").select("creator_id").in("creator_id", ids)
        : { data: [] };
      const profs = profsRes.data || [];
      const items = itemsRes.data || [];
      const downloads = dlRes.data || [];
      const pmap = new Map<string, string>((profs || []).map((p: any) => [String(p.id), String(p.full_name || "")]));
      const assetCount = new Map<string, number>();
      (items || []).forEach((it: any) => assetCount.set(it.creator_id, (assetCount.get(it.creator_id) || 0) + 1));
      const dlCount = new Map<string, number>();
      (downloads || []).forEach((d: any) => dlCount.set(d.creator_id, (dlCount.get(d.creator_id) || 0) + 1));

      const final: Creator[] = (data || []).map((r: any, i: number) => ({
        rank: i + 1,
        creator_id: r.creator_id,
        name: pmap.get(r.creator_id) || "Creator",
        avatar: AVATARS[i % AVATARS.length],
        revenue: Number(r.total_earnings) || 0,
        downloads: dlCount.get(r.creator_id) || 0,
        assets: assetCount.get(r.creator_id) || 0,
        badge: badgeFor(Number(r.total_earnings) || 0),
      }));

      if (!cancelled) {
        setCreators(final);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" /> Creator Leaderboard
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : creators.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No creator earnings recorded yet. Upload your first asset to appear here.
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {creators.slice(0, 3).map((c) => (
              <Card key={c.creator_id} className={`p-4 text-center ${getRankStyle(c.rank)} border`}>
                <div className="text-4xl mb-2">
                  {c.rank === 1 ? "🥇" : c.rank === 2 ? "🥈" : "🥉"}
                </div>
                <div className="text-3xl mb-1">{c.avatar}</div>
                <h3 className="font-bold text-sm truncate">{c.name}</h3>
                <Badge variant="secondary" className={`mt-1 text-[10px] ${getBadgeColor(c.badge)}`}>
                  {c.badge}
                </Badge>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Download className="w-3 h-3" />
                    {c.downloads.toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold text-green-400">
                    €{c.revenue.toLocaleString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList>
              <TabsTrigger value="alltime">All Time</TabsTrigger>
            </TabsList>
            <TabsContent value={period}>
              <Card className="divide-y divide-border">
                {creators.map((c) => (
                  <div key={c.creator_id} className="flex items-center gap-3 p-3">
                    <span className="text-sm font-bold w-6 text-center">#{c.rank}</span>
                    <span className="text-xl">{c.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.assets} assets</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {c.downloads.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-400">€{c.revenue.toLocaleString()}</p>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] ${getBadgeColor(c.badge)}`}>
                      {c.badge}
                    </Badge>
                  </div>
                ))}
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
