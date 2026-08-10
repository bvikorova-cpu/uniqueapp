import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X, Check, Heart, Sword, Shield, Zap, Loader2, Shuffle, Trophy, Skull, Swords } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

export interface ArenaCharacter {
  id: string;
  name: string;
  image_url: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  category: string;
  level?: number;
  experience?: number;
  experience_to_next_level?: number;
  wins?: number;
  losses?: number;
}

interface Props {
  myFighter: ArenaCharacter | null;
  onFight?: (opponent: ArenaCharacter) => void;
}

export const powerOf = (c: ArenaCharacter) =>
  Math.round(
    c.attack * 2 + c.defense * 1.5 + c.speed * 1.2 + c.hp * 0.4 + (c.level || 1) * 10
  );

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const OpponentMatchmaker = ({ myFighter, onFight }: Props) => {
  const [pool, setPool] = useState<ArenaCharacter[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [verdict, setVerdict] = useState<{ won: boolean; opponent: ArenaCharacter; mine: number; theirs: number } | null>(null);
  const [swipe, setSwipe] = useState<"left" | "right" | null>(null);

  const opponent = pool[index] || null;

  const loadPool = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const query = supabase
        .from("characters")
        .select("id, name, image_url, hp, attack, defense, speed, category, level, experience, experience_to_next_level, wins, losses")
        .limit(120);
      const { data, error } = user ? await query.neq("user_id", user.id) : await query;
      if (error) throw error;
      setPool(shuffle((data || []) as ArenaCharacter[]));
      setIndex(0);
    } catch (e) {
      console.error(e);
      toast.error("Failed to find opponents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPool();
  }, []);

  const myPower = useMemo(() => (myFighter ? powerOf(myFighter) : 0), [myFighter]);

  const nextOpponent = (dir: "left" | "right") => {
    setSwipe(dir);
    setTimeout(() => {
      setSwipe(null);
      setIndex((i) => {
        const n = i + 1;
        if (n >= pool.length) {
          setPool((p) => shuffle(p));
          return 0;
        }
        return n;
      });
    }, 260);
  };

  const accept = async () => {
    if (!myFighter || !opponent) return;
    setResolving(true);
    const mine = myPower;
    const theirs = powerOf(opponent);
    const won = mine >= theirs;
    try {
      await supabase.rpc("update_battle_stats", {
        winner_id: won ? myFighter.id : opponent.id,
        loser_id: won ? opponent.id : myFighter.id,
      });
    } catch (e) {
      console.error("Failed to save battle result", e);
    }
    setResolving(false);
    setVerdict({ won, opponent, mine, theirs });
    if (won) confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  };

  const closeVerdict = () => {
    setVerdict(null);
    nextOpponent("right");
  };

  if (loading) {
    return (
      <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50 p-10 flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <p className="text-gray-300">Searching the arena for rivals...</p>
      </Card>
    );
  }

  if (!opponent) {
    return (
      <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50 p-10 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">No rivals online yet</h3>
        <p className="text-gray-300 text-sm">
          No characters from other players are available right now. Check back soon.
        </p>
        <Button onClick={loadPool} variant="outline" className="border-purple-500">
          <Shuffle className="mr-2 h-4 w-4" /> Search again
        </Button>
      </Card>
    );
  }

  const theirPower = powerOf(opponent);

  return (
    <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50 p-4 sm:p-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
          Find a Rival
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Random fighter from another player · ✕ skip · ✓ fight
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={opponent.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: swipe ? 0 : 1,
            scale: 1,
            x: swipe === "left" ? -260 : swipe === "right" ? 260 : 0,
            rotate: swipe === "left" ? -12 : swipe === "right" ? 12 : 0,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.26 }}
        >
          <div className="relative rounded-2xl overflow-hidden border-4 border-pink-500/70 shadow-2xl">
            <img src={opponent.image_url} alt={opponent.name} className="w-full h-72 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className="bg-purple-600 text-white">Lv {opponent.level || 1}</Badge>
              <Badge className="bg-black/60 text-white">{opponent.category}</Badge>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-2xl font-bold text-white">{opponent.name}</h3>
              <p className="text-pink-300 text-xs">
                {opponent.wins ?? 0}W · {opponent.losses ?? 0}L · Power {theirPower}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-4 gap-2 mt-4 text-center">
        <StatChip icon={<Heart className="h-4 w-4 text-red-400" />} value={opponent.hp} />
        <StatChip icon={<Sword className="h-4 w-4 text-orange-400" />} value={opponent.attack} />
        <StatChip icon={<Shield className="h-4 w-4 text-blue-400" />} value={opponent.defense} />
        <StatChip icon={<Zap className="h-4 w-4 text-yellow-400" />} value={opponent.speed} />
      </div>

      {myFighter && (
        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-xs text-gray-300">
            <span>{myFighter.name} · {myPower}</span>
            <span>{opponent.name} · {theirPower}</span>
          </div>
          <Progress value={(myPower / (myPower + theirPower)) * 100} className="h-3" />
          <p className="text-center text-[11px] text-gray-400">
            {myPower >= theirPower ? "You are the favourite" : "This rival outguns you"}
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-6 mt-6">
        <Button
          onClick={() => nextOpponent("left")}
          size="icon"
          variant="outline"
          className="h-16 w-16 rounded-full border-2 border-red-500 text-red-400 hover:bg-red-500/20"
          aria-label="Skip this rival"
        >
          <X className="h-8 w-8" />
        </Button>
        <Button
          onClick={accept}
          disabled={!myFighter || resolving}
          size="icon"
          className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-40"
          aria-label="Fight this rival"
        >
          {resolving ? <Loader2 className="h-9 w-9 animate-spin" /> : <Check className="h-10 w-10" />}
        </Button>
      </div>
      {!myFighter && (
        <p className="text-center text-xs text-yellow-400 mt-3">Select your fighter first</p>
      )}

      {verdict && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-fade-in">
          <Card className={`w-full max-w-sm p-8 text-center ${verdict.won ? "bg-gradient-to-br from-yellow-400 to-orange-500" : "bg-gradient-to-br from-slate-700 to-slate-900"}`}>
            {verdict.won ? (
              <Trophy className="h-20 w-20 mx-auto mb-4 text-white animate-bounce" />
            ) : (
              <Skull className="h-20 w-20 mx-auto mb-4 text-white/80" />
            )}
            <h3 className="text-3xl font-black text-white mb-1">
              {verdict.won ? "Victory!" : "Defeat"}
            </h3>
            <p className="text-white/90 mb-5 text-sm">
              {verdict.won
                ? `${myFighter?.name} overpowers ${verdict.opponent.name}`
                : `${verdict.opponent.name} overpowers ${myFighter?.name}`}
            </p>
            <div className="flex justify-between text-white font-bold mb-6">
              <span>{verdict.mine}</span>
              <span className="opacity-70">Power</span>
              <span>{verdict.theirs}</span>
            </div>
            <div className="space-y-2">
              {onFight && (
                <Button
                  onClick={() => { const o = verdict.opponent; setVerdict(null); onFight(o); }}
                  className="w-full bg-white/20 text-white hover:bg-white/30 font-bold"
                >
                  <Swords className="mr-2 h-4 w-4" /> Replay in full arena
                </Button>
              )}
              <Button onClick={closeVerdict} className="w-full bg-white text-slate-900 hover:bg-gray-100 font-bold">
                Next rival
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};

const StatChip = ({ icon, value }: { icon: React.ReactNode; value: number }) => (
  <div className="bg-white/5 border border-white/10 rounded-lg py-2 flex flex-col items-center gap-1">
    {icon}
    <span className="text-white font-bold text-sm">{value}</span>
  </div>
);
