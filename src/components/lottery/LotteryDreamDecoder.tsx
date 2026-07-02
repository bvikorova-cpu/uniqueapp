import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Moon, Sparkles, Wand2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLotteryTuningAI, TUNING_COSTS } from "@/hooks/useLotteryTuningAI";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function LotteryDreamDecoder({ onBack }: Props) {
  const { run, loading } = useLotteryTuningAI();
  const [dream, setDream] = useState("");
  const [result, setResult] = useState<any>(null);

  const decode = async () => {
    if (!dream.trim()) return;
    const out = await run<any>("dream_decoder", { dream });
    if (out) setResult(out);
  };

  const numbers: number[] = result?.numbers ?? [];

  return (
    <>
      <FloatingHowItWorks
        title='Lottery Dream Decoder'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Lottery Dream Decoder panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Dream Decoder</h2>
          <p className="text-sm text-muted-foreground">Turn last night's dream into lucky numbers · {TUNING_COSTS.dream_decoder} credits</p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-purple-950/40 via-card/80 to-amber-950/30 border-amber-400/20 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-black">
            <Moon className="w-5 h-5 text-amber-400" /> Describe your dream
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            placeholder="I was flying over a golden city, three white wolves were chasing the moon..."
            rows={6}
            className="bg-background/50 border-amber-400/20 focus:border-amber-400/50"
          />
          <Button
            onClick={decode}
            disabled={!dream.trim() || loading === "dream_decoder"}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:opacity-90"
            size="lg"
          >
            {loading === "dream_decoder" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
            Decode dream → {TUNING_COSTS.dream_decoder} credits
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl border-amber-400/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-black">
                <Sparkles className="w-5 h-5 text-amber-400" /> Your dream-numbers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 justify-center">
                {numbers.map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.08, type: "spring" }}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center font-black text-xl text-black shadow-[0_0_25px_rgba(251,191,36,0.4)]"
                  >
                    {n}
                  </motion.div>
                ))}
              </div>
              {result.symbols?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Detected symbols</p>
                  <div className="flex flex-wrap gap-2">
                    {result.symbols.map((s: string, i: number) => (
                      <Badge key={i} variant="outline" className="border-amber-400/40 text-amber-300">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {result.interpretation && (
                <div className="p-4 rounded-lg bg-background/50 border border-amber-400/20">
                  <p className="text-sm leading-relaxed text-foreground/90">{result.interpretation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
}
