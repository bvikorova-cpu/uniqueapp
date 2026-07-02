import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Trophy, Heart } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const LEVEL_NAMES: Record<number, string> = {
  1: "New Friend", 2: "Acquaintance", 3: "Buddy", 4: "Close Friend",
  5: "Best Friend", 6: "Confidant", 7: "Inner Circle", 8: "Lifelong Bond",
  9: "Kindred Spirit", 10: "Soulmate",
};

export const FriendshipHUD = () => {
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("best_friend_progress")
      .select("*").eq("user_id", user.id).maybeSingle();
    setProgress(data);
  })(); }, []);

  if (!progress) return null;
  const level = progress.level || 1;
  const xp = progress.xp || 0;
  const xpForNext = ((level) ** 2) * 50;
  const xpForCurrent = ((level - 1) ** 2) * 50;
  const pct = Math.max(0, Math.min(100, ((xp - xpForCurrent) / Math.max(1, xpForNext - xpForCurrent)) * 100));
  const levelName = LEVEL_NAMES[Math.min(10, level)] || "Soulmate+";

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20">
      <FloatingHowItWorks
        title={"Friendship H U D"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <CardContent className="p-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <Heart className="h-5 w-5 text-pink-400 mx-auto mb-1"/>
          <div className="text-xs text-muted-foreground">Level {level}</div>
          <div className="text-sm font-bold">{levelName}</div>
          <Progress value={pct} className="h-1 mt-1"/>
          <div className="text-[10px] text-muted-foreground mt-0.5">{xp} XP</div>
        </div>
        <div className="text-center">
          <Flame className="h-5 w-5 text-orange-400 mx-auto mb-1"/>
          <div className="text-xs text-muted-foreground">Streak</div>
          <div className="text-2xl font-black">{progress.current_streak || 0}</div>
          <div className="text-[10px] text-muted-foreground">days in a row</div>
        </div>
        <div className="text-center">
          <Trophy className="h-5 w-5 text-yellow-400 mx-auto mb-1"/>
          <div className="text-xs text-muted-foreground">Best</div>
          <div className="text-2xl font-black">{progress.longest_streak || 0}</div>
          <div className="text-[10px] text-muted-foreground">longest streak</div>
        </div>
      </CardContent>
    </Card>
  );
};
