import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Flame, Snowflake, Activity, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLotteryTuningAI, TUNING_COSTS } from "@/hooks/useLotteryTuningAI";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const LOTTERIES = [
  { id: "eurojackpot", name: "EuroJackpot", max: 50 },
  { id: "lotto", name: "Lotto 6/49", max: 49 },
  { id: "powerball", name: "Powerball", max: 69 },
  { id: "megamillions", name: "Mega Millions", max: 70 },
];

export function LotteryHeatmapLab({ onBack }: Props) {
  const { run, loading } = useLotteryTuningAI();
  const [lottery, setLottery] = useState(LOTTERIES[0]);
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    const out = await run<any>("heatmap_analysis", { lottery: lottery.id, max_number: lottery.max });
    if (out) setResult(out);
  };

  const heatFor = (n: number): string => {
    const hot = (result?.hot ?? []) as number[];
    const cold = (result?.cold ?? []) as number[];
    if (hot.includes(n)) return "bg-gradient-to-br from-red-500/80 to-orange-500/60 text-white border-red-400/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]";
    if (cold.includes(n)) return "bg-gradient-to-br from-blue-500/70 to-cyan-500/50 text-white border-blue-400/50";
    return "bg-muted/30 border-border/30 text-muted-foreground";
  };

  return (
    <>
      <FloatingHowItWorks
        title='Lottery Heatmap Lab'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Lottery Heatmap Lab panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Heatmap & Pattern Lab</h2>
          <p className="text-sm text-muted-foreground">AI hot/cold map across history · {TUNING_COSTS.heatmap_analysis} credits</p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-rose-950/30 via-card/80 to-amber-950/30 border-amber-400/20 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-black">
            <Activity className="w-5 h-5 text-amber-400" /> Configure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={lottery.id} onValueChange={(v) => setLottery(LOTTERIES.find((l) => l.id === v)!)}>
            <SelectTrigger className="bg-background/50 border-amber-400/20"><SelectValue /></SelectTrigger>
            <SelectContent>{LOTTERIES.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
          </Select>
          <Button
            onClick={analyze}
            disabled={loading === "heatmap_analysis"}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:opacity-90"
            size="lg"
          >
            {loading === "heatmap_analysis" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Activity className="w-4 h-4 mr-2" />}
            Analyze patterns → {TUNING_COSTS.heatmap_analysis} credits
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className="bg-card/80 backdrop-blur-xl border-amber-400/30">
            <CardHeader>
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" /> Number heatmap (1–{lottery.max})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5">
                {Array.from({ length: lottery.max }, (_, i) => i + 1).map((n) => (
                  <motion.div
                    key={n}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: n * 0.005 }}
                    className={`aspect-square rounded-lg border flex items-center justify-center text-xs font-bold ${heatFor(n)}`}
                  >{n}</motion.div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gradient-to-br from-red-500 to-orange-500" /> Hot</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gradient-to-br from-blue-500 to-cyan-500" /> Cold</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-muted/50 border border-border" /> Neutral</span>
              </div>
            </CardContent>
          </Card>

          {result.insights && (
            <Card className="bg-card/80 backdrop-blur-xl border-amber-400/30">
              <CardHeader><CardTitle className="text-base font-black">AI insights</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{result.insights}</p></CardContent>
            </Card>
          )}
        </>
      )}
    </div>
    </>
  );
}
