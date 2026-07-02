import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Crown, Medal, Trophy, Star, TrendingUp, Users } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  onBack: () => void;
}

export const ComedianHallOfFame = ({ onBack }: Props) => {
  const [comedians, setComedians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComedians();
  }, []);

  const loadComedians = async () => {
    const { data } = await supabase
      .from("comedian_profiles")
      .select("*")
      .order("follower_count", { ascending: false })
      .limit(50);
    setComedians(data || []);
    setLoading(false);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Medal className="h-6 w-6 text-amber-700" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{index + 1}</span>;
  };

  const getRankBg = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30";
    if (index === 1) return "bg-gradient-to-r from-gray-300/10 to-gray-400/10 border-gray-400/30";
    if (index === 2) return "bg-gradient-to-r from-amber-600/10 to-amber-700/10 border-amber-700/30";
    return "";
  };

  const achievements = [
    { icon: "🎤", label: "First Show", desc: "Performed first live show" },
    { icon: "🔥", label: "Hot Streak", desc: "5 shows in a row with 50+ audience" },
    { icon: "💰", label: "Top Earner", desc: "Earned 10,000+ coins total" },
    { icon: "👑", label: "Comedy King", desc: "Won 10 comedy battles" },
    { icon: "⭐", label: "Fan Favorite", desc: "Received 1,000+ tips" },
    { icon: "🏆", label: "Hall of Famer", desc: "Top 10 comedian for 30 days" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Comedian Hall Of Fame - How it works"} steps={[{ title: 'Open', desc: 'Access the Comedian Hall Of Fame section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Comedian Hall Of Fame.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl sm:text-3xl font-black">Hall of Fame</h2>
      </div>

      {/* Achievement Showcase */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 border-yellow-500/20">
        <h3 className="font-black text-lg mb-3 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" /> Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {achievements.map((ach) => (
            <div key={ach.label} className="p-3 bg-background/50 rounded-lg text-center">
              <span className="text-2xl">{ach.icon}</span>
              <p className="text-sm font-bold mt-1">{ach.label}</p>
              <p className="text-xs text-muted-foreground">{ach.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Leaderboard */}
      <Card className="p-4 sm:p-6">
        <h3 className="font-black text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Top Comedians Leaderboard
        </h3>
        <div className="space-y-2">
          {comedians.map((comedian, i) => (
            <motion.div
              key={comedian.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${getRankBg(i)}`}
            >
              {getRankIcon(i)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold truncate">{comedian.stage_name}</p>
                  {comedian.is_verified && <Badge variant="secondary" className="text-xs">✓ Verified</Badge>}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{comedian.bio || "Mystery comedian"}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-sm font-bold">
                  <Users className="h-3 w-3" />
                  {comedian.follower_count || 0}
                </div>
                <p className="text-xs text-muted-foreground">followers</p>
              </div>
            </motion.div>
          ))}

          {comedians.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No comedians registered yet. Be the first!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
    </>
  );
};
