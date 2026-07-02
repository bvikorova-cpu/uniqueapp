import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dices, Loader2, ArrowLeft, Sparkles, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface RealityLotteryProps {
  onBack: () => void;
}

const RealityLottery = ({ onBack }: RealityLotteryProps) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSpin = async () => {
    try {
      setSpinning(true);
      setResult(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please sign in", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke('reality-lottery');
      
      if (error) throw error;

      if (data?.universe) {
        setResult(data.universe);
      } else {
        // Fallback generated result
        const scenarios = [
          { name: "Quantum Physicist in Geneva", score: 87, divergence: "You pursued physics instead", traits: ["Analytical", "Curious", "Patient"], achievements: ["Published 12 papers", "CERN collaboration", "Nobel nominee"] },
          { name: "Street Food Chef in Bangkok", score: 72, divergence: "You followed culinary passion", traits: ["Creative", "Adventurous", "Social"], achievements: ["Michelin star", "TV show host", "Cookbook author"] },
          { name: "Space Tourism CEO", score: 94, divergence: "You invested in SpaceX early", traits: ["Visionary", "Risk-taker", "Leader"], achievements: ["$2B company", "First civilian Mars trip", "TIME Person of Year"] },
          { name: "Marine Biologist in Maldives", score: 68, divergence: "You studied marine biology", traits: ["Nature lover", "Dedicated", "Calm"], achievements: ["Discovered 3 species", "Ocean conservation award", "Documentary featured"] },
          { name: "AI Research Lead at DeepMind", score: 91, divergence: "You specialized in AI", traits: ["Brilliant", "Methodical", "Driven"], achievements: ["AGI breakthrough", "100+ citations", "TED speaker"] },
        ];
        setResult(scenarios[Math.floor(Math.random() * scenarios.length)]);
      }

      toast({ title: "Reality Generated!", description: "Your random parallel life has been revealed!" });
    } catch (e) {
      console.error(e);
      toast({ title: "Lottery Failed", description: "Please try again", variant: "destructive" });
    } finally {
      setSpinning(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Reality Lottery'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Reality Lottery panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </Button>

      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Dices className="w-6 h-6 text-amber-400" />
            Reality Lottery
          </CardTitle>
          <CardDescription>Randomly generate a completely new parallel life and discover who you could have been</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSpin} disabled={spinning} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-lg py-6">
            {spinning ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /><Sparkles className="w-5 h-5 mr-2 animate-pulse" /> Spinning the Multiverse...</>
            ) : (
              <><Dices className="w-5 h-5 mr-2" /> Spin the Reality Wheel</>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-950/10 to-background overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-amber-400">{result.name}</CardTitle>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">{result.score}/100</Badge>
            </div>
            <CardDescription>{result.divergence}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-amber-400 mb-2">Success Score</p>
              <Progress value={result.score} className="h-3" />
            </div>

            {result.traits && (
              <div>
                <p className="text-xs font-semibold text-amber-400 mb-2">Key Traits</p>
                <div className="flex flex-wrap gap-2">
                  {result.traits.map((t: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </div>
            )}

            {result.achievements && (
              <div>
                <p className="text-xs font-semibold text-amber-400 mb-2">Achievements</p>
                <ul className="space-y-1">
                  {result.achievements.map((a: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Trophy className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={handleSpin} variant="outline" className="w-full mt-4 border-amber-500/30">
              <Dices className="w-4 h-4 mr-2" /> Spin Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
};

export default RealityLottery;
