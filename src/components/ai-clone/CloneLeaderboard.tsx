import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Bot, MessageCircle, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface LeaderboardEntry {
  id: string;
  clone_name: string;
  total_conversations: number;
  subscription_tier: string;
}

export function CloneLeaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("personality_clones")
        .select("id, clone_name, total_conversations, subscription_tier")
        .eq("is_active", true)
        .order("total_conversations", { ascending: false })
        .limit(10);
      setLeaders(data || []);
    };
    fetch();
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <>
      <FloatingHowItWorks title={"Clone Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Clone Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Clone Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Clone Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaders.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No active clones yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaders.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl border ${i < 3 ? "bg-primary/5 border-primary/20" : "bg-background/50 border-border/50"}`}
              >
                <span className="text-lg w-8 text-center font-black">
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </span>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{entry.clone_name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="h-3 w-3" />
                    {entry.total_conversations} chats
                  </div>
                </div>
                {entry.subscription_tier === "celebrity" && (
                  <Badge variant="default" className="text-[10px]">
                    <Crown className="h-3 w-3 mr-1" /> Celebrity
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
