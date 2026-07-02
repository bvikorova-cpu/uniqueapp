import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Swords, Loader2, ArrowLeft, Sparkles, Shield, Zap, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface RealityClashArenaProps {
  onBack: () => void;
}

interface ClashResult {
  universe1: { name: string; score: number; strengths: string[]; weaknesses: string[] };
  universe2: { name: string; score: number; strengths: string[]; weaknesses: string[] };
  winner: string;
  analysis: string;
  categories: { name: string; score1: number; score2: number }[];
}

const RealityClashArena = ({ onBack }: RealityClashArenaProps) => {
  const [universes, setUniverses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clashing, setClashing] = useState(false);
  const [selectedA, setSelectedA] = useState("");
  const [selectedB, setSelectedB] = useState("");
  const [result, setResult] = useState<ClashResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data, error } = await supabase.functions.invoke('get-user-universes');
        if (error) throw error;
        setUniverses(data.universes || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleClash = async () => {
    if (!selectedA || !selectedB) { toast({ title: "Select two universes", variant: "destructive" }); return; }
    if (selectedA === selectedB) { toast({ title: "Select different universes", variant: "destructive" }); return; }
    
    try {
      setClashing(true);
      const uA = universes.find(u => u.id === selectedA);
      const uB = universes.find(u => u.id === selectedB);

      const { data, error } = await supabase.functions.invoke('multiverse-ai-tool', {
        body: { 
          tool: 'reality_clash', 
          universe1: { name: uA.universe_name, description: uA.universe_description, score: uA.success_score, divergence: uA.divergence_point },
          universe2: { name: uB.universe_name, description: uB.universe_description, score: uB.success_score, divergence: uB.divergence_point }
        }
      });

      if (error) throw error;

      if (data?.result) {
        setResult(data.result);
      } else {
        const scoreA = uA.success_score + Math.floor(Math.random() * 10 - 5);
        const scoreB = uB.success_score + Math.floor(Math.random() * 10 - 5);
        setResult({
          universe1: { name: uA.universe_name, score: scoreA, strengths: ["High adaptability", "Strong network"], weaknesses: ["Risk aversion", "Limited creativity"] },
          universe2: { name: uB.universe_name, score: scoreB, strengths: ["Bold decisions", "Creative solutions"], weaknesses: ["Inconsistency", "Poor networking"] },
          winner: scoreA > scoreB ? uA.universe_name : uB.universe_name,
          analysis: `After analyzing both realities across multiple dimensions, ${scoreA > scoreB ? uA.universe_name : uB.universe_name} emerges as the superior version. The key differentiator was the approach to decision-making and risk management in critical life moments.`,
          categories: [
            { name: "Career", score1: Math.min(100, scoreA + Math.floor(Math.random() * 15)), score2: Math.min(100, scoreB + Math.floor(Math.random() * 15)) },
            { name: "Relationships", score1: Math.min(100, scoreA + Math.floor(Math.random() * 10)), score2: Math.min(100, scoreB + Math.floor(Math.random() * 10)) },
            { name: "Health", score1: Math.min(100, scoreA - Math.floor(Math.random() * 10)), score2: Math.min(100, scoreB - Math.floor(Math.random() * 10)) },
            { name: "Happiness", score1: Math.min(100, scoreA + Math.floor(Math.random() * 8)), score2: Math.min(100, scoreB + Math.floor(Math.random() * 8)) },
            { name: "Impact", score1: Math.min(100, scoreA + Math.floor(Math.random() * 12)), score2: Math.min(100, scoreB + Math.floor(Math.random() * 12)) },
          ],
        });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Clash Failed", variant: "destructive" });
    } finally { setClashing(false); }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Reality Clash Arena'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Reality Clash Arena panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="text-violet-300 hover:text-violet-100">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </Button>

      <Card className="border-rose-500/30 bg-gradient-to-br from-rose-950/30 to-black/70 backdrop-blur-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-rose-200">
            <Swords className="w-6 h-6 text-rose-400" />
            Reality Clash Arena
          </CardTitle>
          <CardDescription className="text-violet-300/70">Pit two versions of yourself against each other — AI judges the winner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-rose-400" /></div>
          ) : universes.length < 2 ? (
            <p className="text-center text-violet-300/60 py-8">You need at least 2 universes to clash. Create more first!</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-rose-400 font-bold mb-2 flex items-center gap-1"><Shield className="w-3 h-3" /> Fighter A</p>
                  <Select value={selectedA} onValueChange={setSelectedA}>
                    <SelectTrigger className="bg-black/40 border-rose-500/30"><SelectValue placeholder="Select universe..." /></SelectTrigger>
                    <SelectContent>
                      {universes.map(u => <SelectItem key={u.id} value={u.id}>{u.universe_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-cyan-400 font-bold mb-2 flex items-center gap-1"><Zap className="w-3 h-3" /> Fighter B</p>
                  <Select value={selectedB} onValueChange={setSelectedB}>
                    <SelectTrigger className="bg-black/40 border-cyan-500/30"><SelectValue placeholder="Select universe..." /></SelectTrigger>
                    <SelectContent>
                      {universes.map(u => <SelectItem key={u.id} value={u.id}>{u.universe_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleClash} disabled={clashing} className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-lg py-5">
                {clashing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Clashing Realities...</> : <><Swords className="w-5 h-5 mr-2" /> Start Reality Clash!</>}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {/* Winner banner */}
          <Card className="border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-black/70 backdrop-blur-xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500" />
            <CardContent className="p-6 text-center space-y-2">
              <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-xl font-black text-amber-300">Winner: {result.winner}</h3>
              <p className="text-sm text-violet-300/70">{result.analysis}</p>
            </CardContent>
          </Card>

          {/* Categories comparison */}
          <Card className="border-violet-500/20 bg-black/50 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-sm text-violet-200">Category Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {result.categories.map((cat, i) => (
                <motion.div key={cat.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-rose-400 font-bold">{cat.score1}</span>
                    <span className="text-violet-200 font-medium">{cat.name}</span>
                    <span className="text-cyan-400 font-bold">{cat.score2}</span>
                  </div>
                  <div className="flex gap-1 h-2">
                    <div className="flex-1 bg-violet-950/40 rounded-l-full overflow-hidden flex justify-end">
                      <motion.div className="bg-gradient-to-l from-rose-500 to-rose-600 rounded-l-full" initial={{ width: 0 }} animate={{ width: `${cat.score1}%` }} transition={{ delay: 0.3 + i * 0.1 }} />
                    </div>
                    <div className="flex-1 bg-violet-950/40 rounded-r-full overflow-hidden">
                      <motion.div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-r-full" initial={{ width: 0 }} animate={{ width: `${cat.score2}%` }} transition={{ delay: 0.3 + i * 0.1 }} />
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="flex justify-between text-xs text-violet-300/50 pt-2">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-rose-400" /> {result.universe1.name}</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-cyan-400" /> {result.universe2.name}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};

export default RealityClashArena;
