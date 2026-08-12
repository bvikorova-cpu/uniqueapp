import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Swords, X, Check, Loader2, Shuffle, Trophy, Ghost } from "lucide-react";
import { shadowArenaCall } from "@/hooks/useShadowArenaRouter";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Rival {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  duels: number;
  wins: number;
  power: number;
}

interface RoundResult {
  name: string;
  desc: string;
  mine: number;
  theirs: number;
  won: boolean;
}

interface DuelResult {
  won: boolean;
  myScore: number;
  opponentScore: number;
  creditsWon: number;
  pointsWon: number;
  rounds: RoundResult[];
}

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Duet Battles — Brain-Duel style 1v1: swipe through real rivals (X / ✓),
 * then play an instant 3-round shadow duel. 1 credit entry, winner takes 2.
 */
export function DuetBattlesCard() {
  const [pool, setPool] = useState<Rival[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipe, setSwipe] = useState<"left" | "right" | null>(null);
  const [theme, setTheme] = useState("");
  const [duelling, setDuelling] = useState(false);
  const [rival, setRival] = useState<Rival | null>(null);
  const [result, setResult] = useState<DuelResult | null>(null);
  const [revealed, setRevealed] = useState(0);

  const opponent = pool[index] ?? null;

  const loadPool = async () => {
    setLoading(true);
    try {
      const data = await shadowArenaCall<{ opponents: Rival[] }>("duet_opponents", { limit: 25 });
      setPool(shuffle(data.opponents ?? []));
      setIndex(0);
    } catch {
      toast.error("Could not find rivals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPool(); }, []);

  const next = (dir: "left" | "right") => {
    setSwipe(dir);
    setTimeout(() => {
      setSwipe(null);
      setIndex((i) => {
        const n = i + 1;
        if (n >= pool.length) { setPool((prev) => shuffle(prev)); return 0; }
        return n;
      });
    }, 220);
  };

  const accept = async () => {
    if (!opponent) return;
    setRival(opponent);
    setResult(null);
    setRevealed(0);
    setDuelling(true);
    try {
      const data = await shadowArenaCall<DuelResult>("duet_duel", {
        opponent_id: opponent.user_id,
        theme: theme.trim() || "Shadow Duel",
      });
      setResult(data);
      // reveal rounds one by one, like a live duel
      data.rounds.forEach((_, i) => setTimeout(() => setRevealed(i + 1), 700 * (i + 1)));
      setTimeout(() => {
        if (data.won) confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }, 700 * data.rounds.length + 200);
    } catch (e: any) {
      setDuelling(false);
      setRival(null);
      toast.error(
        String(e?.message).includes("insufficient")
          ? "Not enough AI credits (1 needed)"
          : e?.message ?? "Duel failed",
      );
    }
  };

  const close = () => {
    setDuelling(false);
    setRival(null);
    setResult(null);
    setRevealed(0);
    next("right");
  };

  /* ---------- live duel view ---------- */
  if (duelling && rival) {
    const allRevealed = !!result && revealed >= result.rounds.length;
    return (
      <Card className="p-5 mb-6 border-purple-900/40 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold flex items-center gap-2">
            <Swords className="h-5 w-5 text-red-400" /> You vs {rival.display_name}
          </h3>
          <Button variant="outline" size="sm" onClick={close}>Leave</Button>
        </div>

        {!result && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-purple-400" /> Duel in progress...
          </div>
        )}

        {result && (
          <div className="space-y-2">
            {result.rounds.slice(0, revealed).map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border p-3 ${r.won ? "border-emerald-700/40 bg-emerald-950/20" : "border-rose-800/40 bg-rose-950/20"}`}
              >
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>{r.name}</span>
                  <Badge className={r.won ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}>
                    {r.won ? "Won" : "Lost"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
                <div className="mt-2 flex items-center gap-2 text-xs font-mono">
                  <span className="w-10 text-right">{r.mine}</span>
                  <div className="flex-1 h-1.5 rounded bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-purple-500"
                      style={{ width: `${Math.round((r.mine / (r.mine + r.theirs)) * 100)}%` }}
                    />
                  </div>
                  <span className="w-10">{r.theirs}</span>
                </div>
              </motion.div>
            ))}

            {revealed < result.rounds.length && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
              </div>
            )}

            {allRevealed && (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-purple-900/40 p-4 text-center space-y-2">
                <Badge className={result.won ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}>
                  {result.won ? "Victory" : "Defeat"}
                </Badge>
                <p className="text-lg font-black">{result.myScore} : {result.opponentScore}</p>
                {result.won && (
                  <p className="text-sm font-bold text-emerald-500">
                    +{result.creditsWon} credits · +{result.pointsWon} pts
                  </p>
                )}
                <Button onClick={close} className="w-full bg-gradient-to-r from-red-600 to-purple-600 text-white">
                  Next rival
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </Card>
    );
  }

  /* ---------- matchmaking deck ---------- */
  return (
    <Card className="p-5 mb-6 border-purple-900/40">
      <FloatingHowItWorks
        title="Duet Battles — How it works"
        steps={[
          { title: "Pick a theme", desc: "Optionally name the duel theme (e.g. 'Haunted asylum')." },
          { title: "Choose a rival", desc: "Swipe real players: X to skip, ✓ to challenge them." },
          { title: "Duel in 3 rounds", desc: "The duel plays out round by round — 1 credit entry." },
          { title: "Win the pot", desc: "Winner takes 2 credits and 20 prize-pool points." },
        ]}
      />
      <div className="flex items-center gap-2 mb-1">
        <Swords className="h-5 w-5 text-red-400" />
        <h3 className="font-bold">Duet Battles (1v1 Duel)</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Challenge a random real player — 1 credit entry, winner takes 2 credits (20 pts).
      </p>

      <Input
        placeholder="Duel theme (optional)..."
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="mb-4"
      />

      {loading ? (
        <div className="py-10 flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
          <p className="text-sm text-muted-foreground">Looking for rivals...</p>
        </div>
      ) : !opponent ? (
        <div className="py-10 text-center space-y-3">
          <Trophy className="h-9 w-9 mx-auto text-purple-500/50" />
          <p className="text-sm text-muted-foreground">No rivals available yet.</p>
          <Button variant="outline" onClick={loadPool}><Shuffle className="mr-2 h-4 w-4" /> Search again</Button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={opponent.user_id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{
              opacity: swipe ? 0 : 1,
              x: swipe === "left" ? -240 : swipe === "right" ? 240 : 0,
              rotate: swipe === "left" ? -9 : swipe === "right" ? 9 : 0,
              scale: 1,
            }}
            transition={{ duration: 0.22 }}
            className="rounded-xl border border-purple-900/40 bg-black/30 p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border border-purple-800/50">
                {opponent.avatar_url && <AvatarImage src={opponent.avatar_url} alt={opponent.display_name} />}
                <AvatarFallback>{opponent.display_name.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-bold truncate">{opponent.display_name}</p>
                <p className="text-xs text-muted-foreground">
                  {opponent.wins}W · {opponent.duels} duels
                </p>
              </div>
              <Badge variant="outline" className="text-purple-400 border-purple-700/50">
                <Ghost className="h-3 w-3 mr-1" /> Power {opponent.power}
              </Badge>
            </div>

            <div className="flex items-center justify-center gap-6 pt-1">
              <Button size="icon" variant="outline" onClick={() => next("left")}
                className="h-13 w-13 h-14 w-14 rounded-full border-rose-800/50 text-rose-400 hover:bg-rose-950/40">
                <X className="h-6 w-6" />
              </Button>
              <Button size="icon" onClick={accept}
                className="h-16 w-16 rounded-full bg-gradient-to-r from-red-600 to-purple-600 text-white">
                <Check className="h-7 w-7" />
              </Button>
            </div>
            <p className="text-[11px] text-center text-muted-foreground">
              X = skip rival • ✓ = start the duel (1 credit)
            </p>
          </motion.div>
        </AnimatePresence>
      )}
    </Card>
  );
}
