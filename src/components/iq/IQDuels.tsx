import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Loader2, Brain, Trophy, Zap, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const duelModes = [
  { id: "quick", name: "Quick Duel", questions: 5, time: "3 min", credits: 3, icon: Zap, desc: "5 questions, fastest answer wins" },
  { id: "standard", name: "Standard Duel", questions: 10, time: "10 min", credits: 5, icon: Brain, desc: "10 questions, balanced difficulty" },
  { id: "ranked", name: "Ranked Duel", questions: 15, time: "15 min", credits: 8, icon: Trophy, desc: "Affects your league ranking" },
  { id: "blitz", name: "Blitz Duel", questions: 20, time: "5 min", credits: 10, icon: Clock, desc: "20 questions in 5 minutes!" },
];

export default function IQDuels() {
  const [searching, setSearching] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFindDuel = async (modeId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Please login first", variant: "destructive" }); return; }
      
      setSearching(modeId);
      
      // Simulate matchmaking (in real implementation this would use real-time channels)
      setTimeout(() => {
        setSearching(null);
        toast({ title: "Matchmaking", description: "Looking for an opponent... No match found yet. Try again later!", variant: "default" });
      }, 3000);
    } catch (err: any) {
      setSearching(null);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">⚡ Live IQ Duels</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {duelModes.map((mode, i) => (
          <motion.div key={mode.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover:shadow-lg transition-all border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 h-full">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    <mode.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{mode.name}</p>
                    <p className="text-[10px] text-muted-foreground">{mode.desc}</p>
                  </div>
                </div>
                <div className="flex gap-2 mb-3 mt-auto">
                  <Badge variant="outline" className="text-[9px]">{mode.questions}Q</Badge>
                  <Badge variant="outline" className="text-[9px]">{mode.time}</Badge>
                  <Badge variant="outline" className="text-[9px]">{mode.credits} CR</Badge>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                  disabled={searching !== null}
                  onClick={() => handleFindDuel(mode.id)}
                >
                  {searching === mode.id ? (
                    <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Searching...</>
                  ) : (
                    <><Swords className="h-3 w-3 mr-1" /> Find Duel</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
