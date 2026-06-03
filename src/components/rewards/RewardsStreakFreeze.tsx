import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Snowflake, Flame, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

const PACKS = [
  { qty: 1, xp: 200, eur: 0.99, label: "Single Freeze" },
  { qty: 3, xp: 500, eur: 2.49, label: "Triple Pack", popular: true },
  { qty: 7, xp: 1000, eur: 4.99, label: "Week Shield" },
];

export default function RewardsStreakFreeze() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) { setLoading(false); return; }
    const [fr, pts, hist] = await Promise.all([
      supabase.from("user_streak_freezes").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_points").select("total_points, login_streak").eq("user_id", user.id).maybeSingle(),
      supabase.from("streak_freeze_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    ]);
    setData(fr.data);
    setStreak(pts.data?.login_streak ?? 0);
    setHistory(hist.data || []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [user?.id]);

  const buy = async (pack: typeof PACKS[number], method: "xp" | "eur") => {
    if (!user) return;
    if (method === "eur") {
      toast.info("Stripe checkout coming soon");
      return;
    }
    const { data, error } = await supabase.rpc("buy_streak_freeze_xp" as any, {
      _qty: pack.qty,
      _cost_xp: pack.xp,
    });
    if (error) return toast.error(error.message);
    const res = data as any;
    if (!res?.ok) {
      const msg = res?.error === "insufficient_xp" ? "Not enough XP" : (res?.error ?? "Purchase failed");
      return toast.error(msg);
    }
    toast.success(`+${pack.qty} Streak Freeze${pack.qty > 1 ? "s" : ""}! ❄️`);
    refresh();
  };

  if (loading) return <p className="text-sm text-muted-foreground p-4">Loading...</p>;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-cyan-500/30">
        <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Snowflake className="h-6 w-6" />
                <h2 className="text-xl font-bold">Streak Freeze</h2>
              </div>
              <p className="text-sm opacity-90">Protect your streak when life gets busy</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-3xl font-bold">
                <Snowflake className="h-7 w-7" />
                {data?.available_count ?? 0}
              </div>
              <p className="text-xs opacity-80">in inventory</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Flame className="h-4 w-4 text-orange-300" />
            <span>Current streak: <b>{streak} days</b></span>
          </div>
        </div>
        <CardContent className="pt-4">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <p>Auto-applied if you miss a day. Each freeze covers 1 missed day. Max 1 freeze per week.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PACKS.map(pack => (
          <Card key={pack.label} className={`relative ${pack.popular ? "border-cyan-500 shadow-lg shadow-cyan-500/20" : ""}`}>
            {pack.popular && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-cyan-500">
                <Sparkles className="h-3 w-3 mr-1" /> Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-cyan-400" />
                {pack.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold">{pack.qty} <span className="text-sm font-normal text-muted-foreground">freeze{pack.qty > 1 ? "s" : ""}</span></p>
              <Button onClick={() => buy(pack, "xp")} variant="outline" className="w-full">
                {pack.xp} XP
              </Button>
              <Button onClick={() => buy(pack, "eur")} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
                €{pack.eur}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Recent activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map(h => (
                <div key={h.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/30 last:border-0">
                  <span className="capitalize">{h.action} ×{h.quantity}</span>
                  <span className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
