import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Skull,
  ArrowLeft,
  Swords,
  Shield,
  Zap,
  Flame,
  Sparkles,
  Timer,
  Heart,
  Star,
  Crosshair,
} from "lucide-react";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { LevelBadge } from "@/components/character/LevelBadge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Character {
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
}

interface BattleArenaProps {
  character1: Character;
  character2: Character;
  onBattleEnd: () => void;
}

type LogType = "attack" | "damage" | "crit" | "dodge" | "block" | "special" | "victory" | "round";

interface BattleLog {
  message: string;
  type: LogType;
  round: number;
}

type MoveId = "strike" | "heavy" | "guard" | "special";

interface Move {
  id: MoveId;
  name: string;
  desc: string;
  icon: typeof Swords;
  color: string;
  energy: number;
}

const MOVES: Move[] = [
  { id: "strike", name: "Quick Strike", desc: "Fast, reliable hit. +1 energy.", icon: Swords, color: "from-blue-500 to-cyan-500", energy: -1 },
  { id: "heavy", name: "Heavy Blow", desc: "Big damage, can miss.", icon: Flame, color: "from-orange-500 to-red-500", energy: 2 },
  { id: "guard", name: "Guard Stance", desc: "Halve next damage, +2 energy.", icon: Shield, color: "from-emerald-500 to-teal-500", energy: -2 },
  { id: "special", name: "Ultimate", desc: "Devastating combo finisher.", icon: Sparkles, color: "from-fuchsia-500 to-purple-600", energy: 5 },
];

interface FloatNumber {
  id: number;
  side: 1 | 2;
  text: string;
  kind: "crit" | "hit" | "miss" | "heal";
}

const MAX_ENERGY = 8;
const TURN_SECONDS = 10;

export const BattleArena = ({ character1, character2, onBattleEnd }: BattleArenaProps) => {
  const [char1Hp, setChar1Hp] = useState(character1.hp);
  const [char2Hp, setChar2Hp] = useState(character2.hp);
  const [energy, setEnergy] = useState(3);
  const [foeEnergy, setFoeEnergy] = useState(3);
  const [guard, setGuard] = useState<{ 1: boolean; 2: boolean }>({ 1: false, 2: false });
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [momentum, setMomentum] = useState(50); // 0 = foe dominating, 100 = you dominating
  const [round, setRound] = useState(1);
  const [turn, setTurn] = useState<1 | 2>(character1.speed >= character2.speed ? 1 : 2);
  const [battleLog, setBattleLog] = useState<BattleLog[]>([]);
  const [attackingChar, setAttackingChar] = useState<1 | 2 | null>(null);
  const [hitChar, setHitChar] = useState<1 | 2 | null>(null);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [busy, setBusy] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TURN_SECONDS);
  const [floats, setFloats] = useState<FloatNumber[]>([]);
  const [stats, setStats] = useState({ dealt: 0, taken: 0, crits: 0, dodges: 0, specials: 0 });

  const floatId = useRef(0);
  const hpRef = useRef({ 1: character1.hp, 2: character2.hp });
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((message: string, type: LogType, r: number) => {
    setBattleLog((prev) => [...prev, { message, type, round: r }]);
  }, []);

  const pushFloat = (side: 1 | 2, text: string, kind: FloatNumber["kind"]) => {
    const id = ++floatId.current;
    setFloats((prev) => [...prev, { id, side, text, kind }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 1100);
  };

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [battleLog]);

  /* ---------------- combat resolution ---------------- */

  const resolveMove = useCallback(
    async (side: 1 | 2, move: MoveId) => {
      if (winner) return;
      setBusy(true);

      const attacker = side === 1 ? character1 : character2;
      const defender = side === 1 ? character2 : character1;
      const defSide: 1 | 2 = side === 1 ? 2 : 1;
      const currentRound = round;

      // Guard stance
      if (move === "guard") {
        setGuard((g) => ({ ...g, [side]: true }));
        if (side === 1) setEnergy((e) => Math.min(MAX_ENERGY, e + 2));
        else setFoeEnergy((e) => Math.min(MAX_ENERGY, e + 2));
        setCombo(0);
        addLog(`🛡️ ${attacker.name} braces behind a guard stance.`, "block", currentRound);
        pushFloat(side, "GUARD", "heal");
        await wait(700);
        return finishTurn(side);
      }

      setAttackingChar(side);
      const label = MOVES.find((m) => m.id === move)!.name;
      addLog(`${attacker.name} uses ${label}!`, move === "special" ? "special" : "attack", currentRound);
      await wait(520);

      // accuracy
      const speedGap = (defender.speed - attacker.speed) / 100;
      const dodgeChance = Math.min(0.3, Math.max(0.03, 0.08 + speedGap * 0.4)) * (move === "heavy" ? 1.6 : 1);
      if (move !== "special" && Math.random() < dodgeChance) {
        addLog(`💨 ${defender.name} dodges — no damage!`, "dodge", currentRound);
        pushFloat(defSide, "MISS", "miss");
        setCombo(0);
        if (side === 1) setStats((s) => ({ ...s, dodges: s.dodges }));
        setMomentum((m) => clamp(m + (side === 1 ? -8 : 8)));
        setAttackingChar(null);
        await wait(500);
        return finishTurn(side);
      }

      // damage
      const mult = move === "heavy" ? 1.75 : move === "special" ? 2.6 : 1;
      const comboBonus = 1 + Math.min(0.4, combo * 0.08) * (side === 1 ? 1 : 0.6);
      const critChance = 0.12 + attacker.speed / 600 + (move === "heavy" ? 0.1 : 0);
      const isCrit = move !== "guard" && Math.random() < critChance;
      const reduction = defender.defense * 0.5 * (move === "special" ? 0.4 : 1);
      let dmg = Math.max(
        1,
        Math.floor((attacker.attack * mult - reduction) * comboBonus + Math.random() * 10)
      );
      if (isCrit) dmg = Math.floor(dmg * 1.7);
      if (guard[defSide]) {
        dmg = Math.max(1, Math.floor(dmg * 0.45));
        setGuard((g) => ({ ...g, [defSide]: false }));
        addLog(`🛡️ ${defender.name}'s guard absorbs the impact.`, "block", currentRound);
      }

      hpRef.current[defSide] = Math.max(0, hpRef.current[defSide] - dmg);
      if (defSide === 1) setChar1Hp(hpRef.current[1]);
      else setChar2Hp(hpRef.current[2]);

      setHitChar(defSide);
      pushFloat(defSide, `-${dmg}`, isCrit ? "crit" : "hit");
      addLog(
        isCrit
          ? `💥 CRITICAL! ${defender.name} takes ${dmg} damage!`
          : `${defender.name} takes ${dmg} damage.`,
        isCrit ? "crit" : "damage",
        currentRound
      );

      // energy & combo
      if (side === 1) {
        setEnergy((e) => clampEnergy(e - MOVES.find((m) => m.id === move)!.energy));
        setStats((s) => ({
          ...s,
          dealt: s.dealt + dmg,
          crits: s.crits + (isCrit ? 1 : 0),
          specials: s.specials + (move === "special" ? 1 : 0),
        }));
        setCombo((c) => {
          const n = c + 1;
          setMaxCombo((m) => Math.max(m, n));
          return n;
        });
      } else {
        setFoeEnergy((e) => clampEnergy(e - MOVES.find((m) => m.id === move)!.energy));
        setStats((s) => ({ ...s, taken: s.taken + dmg }));
        setCombo(0);
      }
      setMomentum((m) => clamp(m + (side === 1 ? Math.min(14, dmg / 3) : -Math.min(14, dmg / 3))));

      await wait(560);
      setAttackingChar(null);
      setHitChar(null);
      return finishTurn(side);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [winner, round, combo, guard, character1, character2]
  );

  const finishTurn = (side: 1 | 2) => {
    if (hpRef.current[1] <= 0 || hpRef.current[2] <= 0) {
      setBusy(false);
      return;
    }
    if (side === 2) setRound((r) => r + 1);
    setTurn(side === 1 ? 2 : 1);
    setTimeLeft(TURN_SECONDS);
    setBusy(false);
  };

  /* ---------------- AI opponent ---------------- */

  useEffect(() => {
    if (turn !== 2 || winner || busy) return;
    const t = setTimeout(() => {
      const hpPct = hpRef.current[2] / character2.hp;
      let move: MoveId = "strike";
      if (foeEnergy >= 5 && Math.random() < 0.7) move = "special";
      else if (hpPct < 0.3 && foeEnergy < 3 && Math.random() < 0.5) move = "guard";
      else if (foeEnergy >= 2 && Math.random() < 0.45) move = "heavy";
      resolveMove(2, move);
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, winner, busy, foeEnergy]);

  /* ---------------- turn timer (auto Quick Strike) ---------------- */

  useEffect(() => {
    if (turn !== 1 || winner || busy) return;
    if (timeLeft <= 0) {
      resolveMove(1, "strike");
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, timeLeft, winner, busy]);

  /* ---------------- winner ---------------- */

  useEffect(() => {
    const save = async (winnerId: string, loserId: string) => {
      try {
        await supabase.rpc("update_battle_stats", { winner_id: winnerId, loser_id: loserId });
      } catch (error) {
        console.error("Error saving battle result:", error);
      }
    };
    if (winner) return;
    if (char1Hp <= 0) {
      setWinner(2);
      addLog(`🏆 ${character2.name} wins the duel!`, "victory", round);
      save(character2.id, character1.id);
    } else if (char2Hp <= 0) {
      setWinner(1);
      addLog(`🏆 ${character1.name} wins the duel!`, "victory", round);
      save(character1.id, character2.id);
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char1Hp, char2Hp, winner]);

  const char1HpPercent = (char1Hp / character1.hp) * 100;
  const char2HpPercent = (char2Hp / character2.hp) * 100;

  const canUse = (m: Move) => energy >= Math.max(0, m.energy) && turn === 1 && !busy && !winner;

  const fighterCard = (
    c: Character,
    side: 1 | 2,
    hp: number,
    pct: number,
    accent: string
  ) => (
    <div
      className={`relative transition-all duration-300 ${
        attackingChar === side ? (side === 1 ? "scale-105 translate-x-4" : "scale-105 -translate-x-4") : ""
      } ${hitChar === side ? "animate-[shake_0.4s_ease-in-out]" : ""} ${hp <= 0 ? "opacity-50 grayscale" : ""}`}
    >
      <Card className={`bg-black/40 backdrop-blur-lg border-${accent}-500/50 p-4 sm:p-6 overflow-hidden`}>
        <div className="relative">
          <img
            src={c.image_url}
            alt={c.name}
            className="w-full h-56 sm:h-80 object-cover rounded-lg"
          />
          {attackingChar === side && <div className="absolute inset-0 bg-yellow-400/30 rounded-lg animate-pulse" />}
          {hitChar === side && <div className="absolute inset-0 bg-red-500/40 rounded-lg" />}
          {turn === side && !winner && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-black font-bold">Turn</Badge>
          )}
          {/* floating numbers */}
          {floats
            .filter((f) => f.side === side)
            .map((f) => (
              <div
                key={f.id}
                className={`pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 font-black animate-fade-in ${
                  f.kind === "crit"
                    ? "text-4xl sm:text-5xl text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]"
                    : f.kind === "miss"
                    ? "text-2xl text-slate-200"
                    : f.kind === "heal"
                    ? "text-2xl text-emerald-300"
                    : "text-3xl text-red-300"
                }`}
                style={{ animation: "fade-out 1s ease-out forwards" }}
              >
                {f.text}
              </div>
            ))}
        </div>

        <div className="mt-4 space-y-3">
          <h3 className="text-xl sm:text-2xl font-bold text-white text-center">{c.name}</h3>
          {c.level && (
            <LevelBadge
              level={c.level}
              experience={c.experience || 0}
              experienceToNextLevel={c.experience_to_next_level || 100}
            />
          )}
          <div className="space-y-1">
            <div className="flex justify-between text-white text-sm">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-400" /> HP
              </span>
              <span className="font-bold">
                {hp} / {c.hp}
              </span>
            </div>
            <Progress value={pct} className="h-3" />
          </div>
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: MAX_ENERGY }).map((_, i) => (
              <span
                key={i}
                className={`h-2 w-3 rounded-sm ${
                  i < (side === 1 ? energy : foeEnergy)
                    ? "bg-gradient-to-r from-fuchsia-400 to-purple-500"
                    : "bg-white/15"
                }`}
              />
            ))}
          </div>
          {guard[side] && (
            <p className="text-center text-xs text-emerald-300 flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" /> Guarding
            </p>
          )}
        </div>
      </Card>
      {winner === side && (
        <div className="absolute -top-4 -right-4 animate-bounce">
          <Trophy className="h-16 w-16 text-yellow-400" />
        </div>
      )}
      {hp <= 0 && (
        <div className="absolute -top-4 -right-4">
          <Skull className="h-16 w-16 text-gray-400" />
        </div>
      )}
    </div>
  );

  return (
    <>
      <FloatingHowItWorks
        title={"Battle Arena - How it works"}
        steps={[
          { title: "Pick your move", desc: "Each turn choose Quick Strike, Heavy Blow, Guard Stance or your Ultimate." },
          { title: "Build energy", desc: "Quick Strike and Guard charge energy; Heavy Blow and the Ultimate spend it." },
          { title: "Chain combos", desc: "Consecutive hits raise your combo multiplier — crits and momentum swing the duel." },
          { title: "Beat the clock", desc: "You have 10 seconds per turn, otherwise a Quick Strike fires automatically." },
        ]}
      />
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4 sm:p-8">
        <Button onClick={onBattleEnd} variant="ghost" className="mb-4 text-white hover:bg-white/10">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Selection
        </Button>

        {/* Round + momentum HUD */}
        <Card className="max-w-4xl mx-auto mb-6 bg-black/50 backdrop-blur-lg border-yellow-500/40 p-4">
          <div className="flex items-center justify-between gap-3 text-white text-sm">
            <Badge className="bg-yellow-500 text-black font-bold">Round {round}</Badge>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-fuchsia-400" />
              <span className="font-bold">Combo x{combo}</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-cyan-300" />
              <span className={`font-bold ${timeLeft <= 3 && turn === 1 ? "text-red-400" : ""}`}>
                {turn === 1 && !winner ? `${timeLeft}s` : "—"}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-white/70 mb-1">
              <span>{character2.name}</span>
              <span>Momentum</span>
              <span>{character1.name}</span>
            </div>
            <div className="h-2.5 rounded-full bg-red-500/40 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                style={{ width: `${momentum}%` }}
              />
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-6 max-w-5xl mx-auto">
          {fighterCard(character1, 1, char1Hp, char1HpPercent, "blue")}
          {fighterCard(character2, 2, char2Hp, char2HpPercent, "red")}
        </div>

        {/* Move deck */}
        {!winner && (
          <Card className="max-w-4xl mx-auto mb-6 bg-black/60 backdrop-blur-lg border-purple-500/50 p-4">
            <div className="flex items-center gap-2 mb-3 text-white">
              <Crosshair className="h-4 w-4 text-yellow-400" />
              <h3 className="font-bold">
                {turn === 1 ? "Your move" : `${character2.name} is choosing...`}
              </h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {MOVES.map((m) => {
                const Icon = m.icon;
                const enabled = canUse(m);
                return (
                  <button
                    key={m.id}
                    onClick={() => enabled && resolveMove(1, m.id)}
                    disabled={!enabled}
                    className={`text-left rounded-xl p-3 border transition-all ${
                      enabled
                        ? "border-white/20 bg-white/5 hover:scale-[1.03] hover:border-yellow-400/60"
                        : "border-white/10 bg-white/[0.02] opacity-40 cursor-not-allowed"
                    }`}
                  >
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${m.color} mb-2`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="font-bold text-white text-sm">{m.name}</p>
                    <p className="text-[11px] text-white/60 leading-snug">{m.desc}</p>
                    <p className="text-[11px] mt-1 text-fuchsia-300 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {m.energy > 0 ? `${m.energy} energy` : `+${Math.abs(m.energy)} energy`}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Battle Log */}
        <Card className="bg-black/60 backdrop-blur-lg border-purple-500/50 p-4 sm:p-6 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-3 text-center">Battle Log</h3>
          <div ref={logRef} className="space-y-2 max-h-56 overflow-y-auto">
            {battleLog.map((log, index) => (
              <div
                key={index}
                className={`p-2.5 rounded-lg text-sm animate-fade-in ${
                  log.type === "crit"
                    ? "bg-yellow-400/25 text-yellow-100 font-bold"
                    : log.type === "special"
                    ? "bg-fuchsia-500/20 text-fuchsia-100 font-semibold"
                    : log.type === "dodge"
                    ? "bg-slate-500/20 text-slate-200"
                    : log.type === "block"
                    ? "bg-emerald-500/20 text-emerald-100"
                    : log.type === "attack"
                    ? "bg-blue-500/15 text-blue-100"
                    : log.type === "damage"
                    ? "bg-red-500/20 text-red-200"
                    : "bg-green-500/20 text-green-200 font-bold"
                }`}
              >
                <span className="opacity-50 mr-2">R{log.round}</span>
                {log.message}
              </div>
            ))}
          </div>
        </Card>

        {winner && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 animate-fade-in">
            <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 text-center max-w-md w-full">
              {winner === 1 ? (
                <Trophy className="h-24 w-24 mx-auto mb-4 text-white animate-bounce" />
              ) : (
                <Skull className="h-24 w-24 mx-auto mb-4 text-white" />
              )}
              <h2 className="text-4xl font-bold text-white mb-2">
                {winner === 1 ? "Victory!" : "Defeat"}
              </h2>
              <p className="text-2xl text-white mb-6">
                {winner === 1 ? character1.name : character2.name} wins!
              </p>
              <div className="grid grid-cols-2 gap-3 text-left mb-6">
                <Stat label="Rounds" value={round} />
                <Stat label="Best combo" value={`x${maxCombo}`} />
                <Stat label="Damage dealt" value={stats.dealt} />
                <Stat label="Damage taken" value={stats.taken} />
                <Stat label="Critical hits" value={stats.crits} />
                <Stat label="Ultimates" value={stats.specials} />
              </div>
              <Button
                onClick={onBattleEnd}
                size="lg"
                className="w-full bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg"
              >
                Battle Again
              </Button>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-lg bg-black/25 px-3 py-2">
    <p className="text-[11px] uppercase tracking-wide text-white/70">{label}</p>
    <p className="text-lg font-black text-white">{value}</p>
  </div>
);

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clamp = (n: number) => Math.max(0, Math.min(100, n));
const clampEnergy = (n: number) => Math.max(0, Math.min(MAX_ENERGY, n));
