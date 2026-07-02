import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Flame, Target, CheckCircle2, XCircle } from "lucide-react";
import { useDailyChallenge, useSubmitChallenge, useLieLeaderboard } from "@/hooks/useLieDetectorTuning";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const DailySpotTheLieCard = () => {
  const { data, isLoading, refetch } = useDailyChallenge();
  const submit = useSubmitChallenge();
  const lb = useLieLeaderboard(10);
  const [picked, setPicked] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [result, setResult] = useState<any>(null);

  useEffect(() => { setStartedAt(Date.now()); setPicked(null); setResult(null); }, [data?.challenge?.id]);

  const ch = data?.challenge;
  const attempt = data?.attempt;
  const done = !!attempt || !!result;

  const onPick = async (i: number) => {
    if (done || !ch) return;
    setPicked(i);
    const res = await submit.mutateAsync({
      challenge_id: ch.id, selected_index: i, time_taken_ms: Date.now() - startedAt,
    });
    setResult(res);
    refetch();
  };

  const correctIndex = result?.correct_index ?? attempt?.is_correct != null
    ? (attempt?.is_correct ? attempt.selected_index : ch?.correct_index)
    : undefined;

  return (
    <>
      <FloatingHowItWorks title={"Daily Spot The Lie Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Daily Spot The Lie Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Daily Spot The Lie Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-amber-950/40 via-card/80 to-red-950/30 border-amber-500/30 backdrop-blur-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-300" />
              Daily "Spot the Lie"
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/40 text-[10px]">FREE</Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">One puzzle per day · earn points · climb the leaderboard.</p>
          </div>
          {ch?.difficulty && (
            <Badge variant="outline" className="text-[10px] uppercase">{ch.difficulty}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <p className="text-xs text-muted-foreground">Loading today's puzzle...</p>}
        {ch && (
          <>
            <div className="p-3 rounded-lg bg-background/40 border border-amber-500/20">
              <p className="text-xs font-mono uppercase text-amber-300 mb-1">Scenario</p>
              <p className="text-sm">{ch.scenario}</p>
            </div>
            <div className="space-y-2">
              {ch.options?.map((opt: string, i: number) => {
                const isPicked = picked === i || attempt?.selected_index === i;
                const isCorrectAnswer = result?.correct_index === i || (attempt && ch.correct_index === i);
                const showResult = done;
                return (
                  <button
                    key={i}
                    disabled={done}
                    onClick={() => onPick(i)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition ${
                      showResult && isCorrectAnswer
                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-100"
                        : showResult && isPicked
                        ? "bg-red-500/15 border-red-500/50 text-red-100"
                        : "bg-background/40 border-border/40 hover:border-amber-500/40 hover:bg-amber-500/10"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-amber-400">{String.fromCharCode(65 + i)}.</span>
                      <span className="flex-1">{opt}</span>
                      {showResult && isCorrectAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {showResult && isPicked && !isCorrectAnswer && <XCircle className="w-4 h-4 text-red-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
            {(result || attempt) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-amber-300">Result</span>
                  {result && <Badge className="bg-amber-500/20 text-amber-100 border-amber-500/40">+{result.points} pts</Badge>}
                </div>
                <p className="text-xs text-amber-100">{result?.explanation || ch?.explanation || "Already solved today. Come back tomorrow!"}</p>
              </motion.div>
            )}
          </>
        )}

        {/* Leaderboard */}
        <div className="pt-2 border-t border-amber-500/20">
          <p className="text-[11px] uppercase tracking-wide text-amber-300 mb-2 font-mono flex items-center gap-1">
            <Crown className="w-3 h-3" /> Global Leaderboard (Top 10)
          </p>
          <div className="space-y-1 max-h-[180px] overflow-y-auto">
            {lb.data?.length === 0 && <p className="text-xs text-muted-foreground">No players yet — be first!</p>}
            {lb.data?.map((row: any, i: number) => (
              <div key={row.id} className="flex items-center gap-2 text-xs p-1.5 rounded bg-background/30 border border-border/20">
                <span className={`font-mono w-5 text-center ${i === 0 ? "text-amber-300" : i === 1 ? "text-zinc-300" : i === 2 ? "text-orange-400" : "text-muted-foreground"}`}>
                  #{i + 1}
                </span>
                <span className="flex-1 truncate">{row.display_name || "Detective"}</span>
                <span className="flex items-center gap-1 text-orange-300"><Flame className="w-3 h-3" /> {row.current_streak}</span>
                <span className="flex items-center gap-1 text-amber-200 font-bold"><Target className="w-3 h-3" /> {row.total_points}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
};
