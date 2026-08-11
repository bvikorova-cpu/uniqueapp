import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Check, Loader2, Shuffle, Trophy, Swords, Flag, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserHorses } from "@/hooks/useHorseRacing";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { RaceTrack3D } from "./RaceTrack3D";

interface RivalHorse {
  id: string;
  name: string;
  breed: string;
  color: string;
  image_url: string | null;
  level: number;
  speed_stat: number;
  stamina_stat: number;
  acceleration_stat: number;
  temperament_stat: number;
  race_wins: number;
  total_races: number;
  owner_name: string;
}

interface DuelResult {
  won: boolean;
  myTime: number;
  opponentTime: number;
  creditsWon: number;
  log: { sector: string; mine: number; theirs: number; note: string }[];
}

const power = (h: { speed_stat?: number; stamina_stat?: number; acceleration_stat?: number; temperament_stat?: number; level?: number }) =>
  Math.round(
    (h.speed_stat ?? 50) * 1.3 + (h.stamina_stat ?? 50) * 1.1 +
    (h.acceleration_stat ?? 50) * 1.0 + (h.temperament_stat ?? 50) * 0.6 +
    (h.level ?? 1) * 4,
  );

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const StatBar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between text-[11px] font-semibold text-slate-700">
      <span>{label}</span><span>{value}</span>
    </div>
    <div className="h-1.5 rounded-full bg-amber-100 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  </div>
);

/**
 * Head-to-head live racing: pick your horse, swipe through rival horses
 * from other players (X / ✓) and race them 1-vs-1 like a Brain Duel.
 */
export const HorseDuelArena = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { horses } = useUserHorses();

  const [myHorseId, setMyHorseId] = useState("");
  const [pool, setPool] = useState<RivalHorse[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipe, setSwipe] = useState<"left" | "right" | null>(null);
  const [racing, setRacing] = useState(false);
  const [rival, setRival] = useState<RivalHorse | null>(null);
  const [result, setResult] = useState<DuelResult | null>(null);
  const [revealed, setRevealed] = useState(false);

  const myHorse = horses?.find((h: any) => h.id === myHorseId) ?? null;
  const opponent = pool[index] ?? null;

  useEffect(() => {
    if (!myHorseId && horses?.length) setMyHorseId(horses[0].id);
  }, [horses, myHorseId]);

  const loadPool = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_horse_opponents", { _limit: 30 });
      if (error) throw error;
      setPool(shuffle((data ?? []) as RivalHorse[]));
      setIndex(0);
    } catch {
      toast.error("Could not find rival horses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPool(); }, []);

  const myPower = useMemo(() => (myHorse ? power(myHorse) : 0), [myHorse]);

  const next = (dir: "left" | "right") => {
    setSwipe(dir);
    setTimeout(() => {
      setSwipe(null);
      setIndex((i) => {
        const n = i + 1;
        if (n >= pool.length) { setPool((p) => shuffle(p)); return 0; }
        return n;
      });
    }, 240);
  };

  const accept = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!myHorse) { toast.error("Select your horse first"); return; }
    if (!opponent) return;
    setRival(opponent);
    setRevealed(false);
    setResult(null);
    setRacing(true);
    try {
      const { data, error } = await supabase.functions.invoke("horse-router", {
        body: { action: "duel", myHorseId: myHorse.id, opponentHorseId: opponent.id } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as DuelResult);
    } catch (e: any) {
      setRacing(false);
      setRival(null);
      toast.error(e?.message?.includes("Insufficient") ? "Not enough AI credits (1 needed)" : (e?.message ?? "Duel failed"));
    }
  };

  const finishRace = () => {
    setRevealed(true);
    if (result?.won) confetti({ particleCount: 130, spread: 80, origin: { y: 0.6 } });
    queryClient.invalidateQueries({ queryKey: ["user-horses"] });
    queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
    queryClient.invalidateQueries({ queryKey: ["ai-credits"] });
  };

  const closeRace = () => {
    setRacing(false);
    setRival(null);
    setResult(null);
    setRevealed(false);
    next("right");
  };

  /* ---------- live 1v1 race view ---------- */
  if (racing && rival && myHorse) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-black text-lg flex items-center gap-2 text-slate-900">
            <Flag className="h-5 w-5 text-amber-700" /> {myHorse.name} vs {rival.name}
          </h3>
          <Button variant="outline" size="sm" onClick={closeRace}>Leave</Button>
        </div>

        <RaceTrack3D
          participants={[
            { id: myHorse.id, horse: { name: myHorse.name, color: myHorse.color, speed_stat: myHorse.speed_stat, stamina_stat: myHorse.stamina_stat }, position: 0, progress: 0 },
            { id: rival.id, horse: { name: rival.name, color: rival.color, speed_stat: rival.speed_stat, stamina_stat: rival.stamina_stat }, position: 1, progress: 0 },
          ]}
          isRaceActive
          onRaceComplete={finishRace}
        />

        {!revealed && !result && (
          <Card className="p-4 bg-white border-amber-300/60 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-amber-700" />
            <span className="text-sm text-slate-700">Racing head-to-head...</span>
          </Card>
        )}

        {revealed && result && (
          <Card className="p-5 bg-white border-amber-300/60 space-y-3">
            <div className="text-center">
              <Badge className={result.won ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}>
                {result.won ? "Victory" : "Defeat"}
              </Badge>
              <h4 className="text-xl font-black mt-2 text-slate-900">
                {result.won ? `${myHorse.name} wins!` : `${rival.name} wins!`}
              </h4>
              <p className="text-sm text-slate-600 flex items-center justify-center gap-2 mt-1">
                <Timer className="h-4 w-4" /> {result.myTime}s vs {result.opponentTime}s
              </p>
              {result.creditsWon > 0 && (
                <p className="text-sm font-bold text-emerald-700 mt-1">+{result.creditsWon} credits</p>
              )}
            </div>
            <div className="space-y-1.5">
              {result.log.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs rounded-lg bg-amber-50 px-3 py-2 border border-amber-200/70">
                  <span className="font-bold text-slate-800">{s.sector}</span>
                  <span className="text-slate-600">{s.note}</span>
                  <span className="font-mono text-slate-700">{s.mine}s / {s.theirs}s</span>
                </div>
              ))}
            </div>
            <Button onClick={closeRace} className="w-full bg-gradient-to-r from-amber-600 to-rose-600 text-white">
              Next rival
            </Button>
          </Card>
        )}
      </div>
    );
  }

  /* ---------- matchmaking deck ---------- */
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black flex items-center gap-2 text-slate-900">
          <Swords className="h-6 w-6 text-amber-700" /> Head-to-Head Duel
        </h2>
        <p className="text-sm text-slate-600">
          Race 1-vs-1 against another player's horse — 1 credit entry, winner takes 2 credits.
        </p>
      </div>

      <Card className="p-4 bg-white border-amber-300/60 space-y-2">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Your racer</p>
        <Select value={myHorseId} onValueChange={setMyHorseId}>
          <SelectTrigger className="bg-white text-slate-900"><SelectValue placeholder="Choose your horse" /></SelectTrigger>
          <SelectContent>
            {horses?.map((h: any) => (
              <SelectItem key={h.id} value={h.id}>{h.name} — Lvl {h.level} • Power {power(h)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!horses?.length && <p className="text-xs text-rose-600">Buy a horse in your stable first.</p>}
      </Card>

      {loading ? (
        <Card className="p-10 bg-white border-amber-300/60 flex flex-col items-center gap-2">
          <Loader2 className="h-7 w-7 animate-spin text-amber-700" />
          <p className="text-sm text-slate-600">Looking for rivals...</p>
        </Card>
      ) : !opponent ? (
        <Card className="p-10 bg-white border-amber-300/60 text-center space-y-3">
          <Trophy className="h-10 w-10 mx-auto text-amber-500/60" />
          <p className="font-bold text-slate-900">No rival horses available yet</p>
          <Button variant="outline" onClick={loadPool}><Shuffle className="mr-2 h-4 w-4" /> Search again</Button>
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={opponent.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{
              opacity: swipe ? 0 : 1,
              x: swipe === "left" ? -260 : swipe === "right" ? 260 : 0,
              rotate: swipe === "left" ? -10 : swipe === "right" ? 10 : 0,
              scale: 1 }}
            transition={{ duration: 0.24 }}
          >
            <Card className="overflow-hidden bg-white border-amber-300/60">
              <div className="relative aspect-[4/3] bg-amber-100">
                {opponent.image_url ? (
                  <img src={opponent.image_url} alt={`${opponent.name} racehorse portrait`} loading="lazy"
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🐎</div>
                )}
                <Badge className="absolute top-3 left-3 bg-slate-900/80 text-white">
                  Power {power(opponent)}
                </Badge>
                <Badge className="absolute top-3 right-3 bg-amber-600 text-white">Lvl {opponent.level}</Badge>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{opponent.name}</h3>
                  <p className="text-xs text-slate-600 capitalize">
                    {opponent.breed} • {opponent.color} • Owner: {opponent.owner_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {opponent.race_wins} wins / {opponent.total_races} races
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <StatBar label="Speed" value={opponent.speed_stat} />
                  <StatBar label="Stamina" value={opponent.stamina_stat} />
                  <StatBar label="Acceleration" value={opponent.acceleration_stat} />
                  <StatBar label="Temperament" value={opponent.temperament_stat} />
                </div>
                {myHorse && (
                  <p className="text-xs text-center text-slate-600">
                    Your power <span className="font-bold text-slate-900">{myPower}</span> vs{" "}
                    <span className="font-bold text-slate-900">{power(opponent)}</span>
                  </p>
                )}
                <div className="flex items-center justify-center gap-6 pt-1">
                  <Button size="icon" variant="outline" onClick={() => next("left")}
                    className="h-14 w-14 rounded-full border-rose-300 text-rose-600 hover:bg-rose-50">
                    <X className="h-6 w-6" />
                  </Button>
                  <Button size="icon" onClick={accept} disabled={!myHorse}
                    className="h-16 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                    <Check className="h-7 w-7" />
                  </Button>
                </div>
                <p className="text-[11px] text-center text-slate-500">
                  X = skip rival • ✓ = start the live 1-vs-1 race (1 credit)
                </p>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
