import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy, Skull, Handshake, Zap, Shield, Sparkles, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface BattleRound {
  round: number;
  user_move: string;
  user_move_type?: string;
  opponent_move: string;
  opponent_move_type?: string;
  winner: "user" | "opponent";
  damage: number;
  critical?: boolean;
  user_hp: number;
  opponent_hp: number;
  commentary: string;
}

export interface BattleResult {
  opponent_name: string;
  outcome: "win" | "loss" | "draw" | string;
  user_power: number;
  opponent_power: number;
  mode?: string;
  arena?: string;
  rounds?: BattleRound[];
  rounds_won?: number;
  rounds_total?: number;
  final_user_hp?: number;
  final_opponent_hp?: number;
  summary?: string;
  rewards_eur?: number;
  credits_awarded?: number;
  xp_awarded?: number;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  result: BattleResult | null;
  modeName?: string;
  prizeLabel?: string;
  entryCost?: number;
}

const typeIcon = (type?: string) => {
  if (type === "defense" || type === "evasion") return Shield;
  if (type === "ultimate") return Sparkles;
  if (type === "tactic") return Zap;
  return Swords;
};

export const BattleResultDialog = ({ open, onOpenChange, result, modeName, prizeLabel, entryCost }: Props) => {
  const rounds = result?.rounds ?? [];
  const [revealed, setRevealed] = useState(0);

  // Reveal rounds one by one so the fight feels played out, not instant.
  useEffect(() => {
    if (!open || rounds.length === 0) { setRevealed(rounds.length); return; }
    setRevealed(0);
    const timers = rounds.map((_, i) => window.setTimeout(() => setRevealed(i + 1), 700 * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, [open, result]);

  if (!result) return null;

  const outcome = String(result.outcome).toLowerCase();
  const finished = revealed >= rounds.length;
  const OutcomeIcon = outcome === "win" ? Trophy : outcome === "loss" ? Skull : Handshake;
  const outcomeTone =
    outcome === "win" ? "text-emerald-500" : outcome === "loss" ? "text-destructive" : "text-amber-500";
  const totalPower = Math.max(1, result.user_power + result.opponent_power);
  const userHp = result.final_user_hp ?? 100;
  const oppHp = result.final_opponent_hp ?? 100;
  const liveUserHp = rounds.length ? (revealed ? rounds[revealed - 1].user_hp : 100) : userHp;
  const liveOppHp = rounds.length ? (revealed ? rounds[revealed - 1].opponent_hp : 100) : oppHp;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Swords className="w-4 h-4 text-primary" />
            {modeName ?? result.mode} · Battle Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {result.arena && (
            <p className="text-xs text-muted-foreground">
              Arena: <span className="text-foreground font-semibold">{result.arena}</span>
              {entryCost != null && <> · Entry {entryCost} credits</>}
            </p>
          )}

          {/* Combatants */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="space-y-1 text-center">
              <p className="font-black text-sm">Your Avatar</p>
              <Badge variant="outline" className="text-[10px]"><Zap className="w-3 h-3 mr-1" />{result.user_power} PWR</Badge>
              <Progress value={liveUserHp} className="h-2" />
              <p className="text-[10px] text-muted-foreground">{liveUserHp}% integrity</p>
            </div>
            <span className="text-xs font-black text-muted-foreground">VS</span>
            <div className="space-y-1 text-center">
              <p className="font-black text-sm">{result.opponent_name}</p>
              <Badge variant="outline" className="text-[10px]"><Zap className="w-3 h-3 mr-1" />{result.opponent_power} PWR</Badge>
              <Progress value={liveOppHp} className="h-2" />
              <p className="text-[10px] text-muted-foreground">{liveOppHp}% integrity</p>
            </div>
          </div>

          {/* Power balance */}
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Power balance</span>
              <span>{Math.round((result.user_power / totalPower) * 100)}% / {Math.round((result.opponent_power / totalPower) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${(result.user_power / totalPower) * 100}%` }} />
            </div>
          </div>

          {/* Round log */}
          {rounds.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Combat log</p>
              <AnimatePresence>
                {rounds.slice(0, revealed).map((r) => {
                  const UIcon = typeIcon(r.user_move_type);
                  const OIcon = typeIcon(r.opponent_move_type);
                  const userWon = r.winner === "user";
                  return (
                    <motion.div key={r.round} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      className={`rounded-lg border p-3 ${userWon ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/30 bg-destructive/5"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-black">Round {r.round}</span>
                        <div className="flex items-center gap-1">
                          {r.critical && <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-[9px]">CRITICAL</Badge>}
                          <Badge variant="outline" className="text-[9px]">-{r.damage} HP</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                        <UIcon className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">{r.user_move}</span>
                        <span className="opacity-50">vs</span>
                        <OIcon className="w-3 h-3 text-accent shrink-0" />
                        <span className="truncate">{r.opponent_move}</span>
                      </div>
                      <p className="text-xs leading-relaxed">{r.commentary}</p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {!finished && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" /> Simulating next round…
                </p>
              )}
            </div>
          )}

          {/* Verdict */}
          {finished && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-background p-4 text-center space-y-2">
              <OutcomeIcon className={`w-8 h-8 mx-auto ${outcomeTone}`} />
              <p className={`font-black text-lg ${outcomeTone}`}>
                {outcome === "win" ? "Victory" : outcome === "loss" ? "Defeat" : "Draw"}
              </p>
              {result.rounds_total != null && (
                <p className="text-xs text-muted-foreground">Rounds won {result.rounds_won ?? 0} / {result.rounds_total}</p>
              )}
              {result.summary && <p className="text-sm leading-relaxed">{result.summary}</p>}
              {outcome === "win" && (result.xp_awarded ?? 0) > 0 ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                  +{result.xp_awarded} XP added to your profile
                </Badge>
              ) : outcome === "win" && prizeLabel ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Prize {prizeLabel}</Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">No prize — entry fee not refunded</Badge>
              )}
              <Button className="w-full mt-2" onClick={() => onOpenChange(false)}>Close report</Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
