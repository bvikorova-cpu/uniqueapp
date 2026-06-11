import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Swords, Sparkles, Loader2, Trophy, Skull, Minus } from "lucide-react";

interface BattleRow {
  id: string;
  mode: string;
  opponent_name: string;
  outcome: "win" | "loss" | "draw";
  user_power: number;
  opponent_power: number;
  rewards_eur: number;
  created_at: string;
}

interface BreedingRow {
  id: string;
  parent1_id: number;
  parent2_id: number;
  offspring_name: string;
  offspring_style: string;
  offspring_traits: string[] | any;
  offspring_level: number;
  rarity: string;
  created_at: string;
}

const rarityColor: Record<string, string> = {
  common: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  rare: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  epic: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  legendary: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  mythic: "bg-pink-500/20 text-pink-300 border-pink-500/40",
};

const OutcomeIcon = ({ outcome }: { outcome: string }) => {
  if (outcome === "win") return <Trophy className="h-4 w-4 text-emerald-400" />;
  if (outcome === "loss") return <Skull className="h-4 w-4 text-rose-400" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

export default function HolographicHistory() {
  const [tab, setTab] = useState<"battles" | "breeding">("battles");
  const [battles, setBattles] = useState<BattleRow[]>([]);
  const [breeding, setBreeding] = useState<BreedingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthed(false);
        setLoading(false);
        return;
      }
      const [b, br] = await Promise.all([
        supabase
          .from("holographic_battle_results")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("holographic_breeding_results")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      setBattles((b.data as any) || []);
      setBreeding((br.data as any) || []);
      setLoading(false);
    })();
  }, []);

  const wins = battles.filter((b) => b.outcome === "win").length;
  const totalEur = battles.reduce((s, b) => s + Number(b.rewards_eur || 0), 0);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Link to="/holographic-avatars">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Holographic Avatars
          </Button>
        </Link>

        <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
          Holographic History
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Your complete battle & breeding archive.
        </p>

        {!authed ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Sign in to view your history.</p>
            <Link to="/auth"><Button className="mt-3">Sign in</Button></Link>
          </Card>
        ) : loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Card className="p-3 text-center">
                <p className="text-2xl font-black">{battles.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Battles</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-2xl font-black text-emerald-400">{wins}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Wins</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-2xl font-black text-amber-400">€{totalEur.toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Earned</p>
              </Card>
            </div>

            <div className="flex gap-2 mb-4">
              <Button
                variant={tab === "battles" ? "default" : "outline"}
                size="sm"
                onClick={() => setTab("battles")}
                className="flex-1"
              >
                <Swords className="h-4 w-4 mr-2" /> Battles ({battles.length})
              </Button>
              <Button
                variant={tab === "breeding" ? "default" : "outline"}
                size="sm"
                onClick={() => setTab("breeding")}
                className="flex-1"
              >
                <Sparkles className="h-4 w-4 mr-2" /> Breeding ({breeding.length})
              </Button>
            </div>

            {tab === "battles" ? (
              battles.length === 0 ? (
                <Card className="p-6 text-center text-sm text-muted-foreground">
                  No battles yet. Start one from the Holographic Avatars arena.
                </Card>
              ) : (
                <div className="space-y-2">
                  {battles.map((b) => (
                    <Card key={b.id} className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <OutcomeIcon outcome={b.outcome} />
                          <div className="min-w-0">
                            <p className="font-semibold truncate">vs {b.opponent_name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {b.mode} · {new Date(b.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold tabular-nums">
                            {b.user_power} <span className="text-muted-foreground">vs</span> {b.opponent_power}
                          </p>
                          {b.rewards_eur > 0 && (
                            <Badge variant="outline" className="text-[10px] mt-1 border-amber-500/40 text-amber-400">
                              +€{Number(b.rewards_eur).toFixed(2)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            ) : breeding.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                No offspring yet. Breed avatars in the Holographic lab.
              </Card>
            ) : (
              <div className="space-y-2">
                {breeding.map((r) => {
                  const traits = Array.isArray(r.offspring_traits) ? r.offspring_traits : [];
                  return (
                    <Card key={r.id} className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{r.offspring_name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {r.offspring_style} · Lv {r.offspring_level} ·{" "}
                            {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${rarityColor[r.rarity] || rarityColor.common}`}
                        >
                          {r.rarity}
                        </Badge>
                      </div>
                      {traits.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {traits.slice(0, 6).map((t: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
