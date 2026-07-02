import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Loader2, Zap, Trophy, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const modes = [
  { id: "quick", name: "Quick Challenge", desc: "Guess age in 3 rounds", credits: 3, icon: Zap, time: "2 min" },
  { id: "standard", name: "Standard Duel", desc: "5 rounds, closest guess wins", credits: 5, icon: Swords, time: "5 min" },
  { id: "ranked", name: "Ranked Match", desc: "Affects your leaderboard rank", credits: 8, icon: Trophy, time: "10 min" },
  { id: "group", name: "Group Challenge", desc: "Up to 4 players compete", credits: 10, icon: Users, time: "15 min" },
];

export default function FutureFaceDuels() {
  const [searching, setSearching] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFind = async (modeId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast({ title: "Please sign in first", variant: "destructive" }); return; }
    setSearching(modeId);
    setTimeout(() => {
      setSearching(null);
      toast({ title: "Matchmaking", description: "Looking for opponents... No match found yet. Try again later!" });
    }, 3000);
  };

  return (
    <>
      <FloatingHowItWorks title={"Future Face Duels - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face Duels section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face Duels.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">⚔️ Age Challenge Duels</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {modes.map((mode, i) => (
          <motion.div key={mode.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover:shadow-lg transition-all border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 h-full">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 text-white">
                    <mode.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{mode.name}</p>
                    <p className="text-[10px] text-muted-foreground">{mode.desc}</p>
                  </div>
                </div>
                <div className="flex gap-2 mb-3 mt-auto">
                  <Badge variant="outline" className="text-[9px]">{mode.time}</Badge>
                  <Badge variant="outline" className="text-[9px]">{mode.credits} CR</Badge>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600"
                  disabled={searching !== null}
                  onClick={() => handleFind(mode.id)}
                >
                  {searching === mode.id ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Searching...</> : <><Swords className="h-3 w-3 mr-1" /> Find Duel</>}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
}
