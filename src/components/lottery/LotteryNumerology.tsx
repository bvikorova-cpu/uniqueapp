import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Hash, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLotteryTuningAI, TUNING_COSTS } from "@/hooks/useLotteryTuningAI";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function LotteryNumerology({ onBack }: Props) {
  const { run, loading } = useLotteryTuningAI();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<any>(null);

  const compute = async () => {
    if (!name || !birthDate) return;
    const out = await run<any>("numerology", { full_name: name, birth_date: birthDate });
    if (out) setResult(out);
  };

  return (
    <>
      <FloatingHowItWorks
        title='Lottery Numerology'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Lottery Numerology panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Numerology Profile</h2>
          <p className="text-sm text-muted-foreground">Personal numbers from your name + birth date · {TUNING_COSTS.numerology} credits</p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-indigo-950/40 via-card/80 to-amber-950/30 border-amber-400/20 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-black">
            <Hash className="w-5 h-5 text-amber-400" /> Your details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" className="bg-background/50 border-amber-400/20" />
          </div>
          <div className="space-y-2">
            <Label>Birth date</Label>
            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="bg-background/50 border-amber-400/20" />
          </div>
          <Button
            onClick={compute}
            disabled={!name || !birthDate || loading === "numerology"}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:opacity-90"
            size="lg"
          >
            {loading === "numerology" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Reveal numerology → {TUNING_COSTS.numerology} credits
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Life Path", value: result.life_path },
            { label: "Destiny", value: result.destiny },
            { label: "Soul Number", value: result.soul },
          ].map((c, i) => (
            <Card key={i} className="bg-card/80 backdrop-blur-xl border-amber-400/30 text-center">
              <CardContent className="pt-6">
                <div className="text-5xl font-black bg-gradient-to-br from-amber-300 to-yellow-500 bg-clip-text text-transparent">{c.value ?? "—"}</div>
                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">{c.label}</p>
              </CardContent>
            </Card>
          ))}

          {result.lucky_numbers?.length > 0 && (
            <Card className="bg-card/80 backdrop-blur-xl border-amber-400/30 md:col-span-3">
              <CardHeader><CardTitle className="text-base font-black">Your lucky numbers</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 justify-center">
                  {result.lucky_numbers.map((n: number, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.06, type: "spring" }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center font-black text-black shadow-[0_0_20px_rgba(251,191,36,0.35)]"
                    >{n}</motion.div>
                  ))}
                </div>
                {result.summary && <p className="text-sm text-muted-foreground mt-4 text-center max-w-xl mx-auto">{result.summary}</p>}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
    </>
  );
}
