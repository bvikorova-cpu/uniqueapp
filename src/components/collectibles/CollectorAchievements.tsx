import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Gem, Crown, Flame, Target, Zap, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { userId: string; }

const achievementDefs = [
  { code: "first_item", name: "First Find", desc: "Acquire your first collectible", icon: Star, target: 1, reward: "5 credits" },
  { code: "collector_10", name: "Budding Collector", desc: "Collect 10 items", icon: Gem, target: 10, reward: "15 credits" },
  { code: "collector_50", name: "Master Collector", desc: "Collect 50 items", icon: Crown, target: 50, reward: "50 credits" },
  { code: "collector_100", name: "Legendary Hoarder", desc: "Collect 100 items", icon: Trophy, target: 100, reward: "100 credits" },
  { code: "diversity_5", name: "Diverse Taste", desc: "Collect 5 different types", icon: Target, target: 5, reward: "20 credits" },
  { code: "mystery_opener", name: "Box Breaker", desc: "Open 10 mystery boxes", icon: Zap, target: 10, reward: "25 credits" },
  { code: "trader", name: "Deal Maker", desc: "Complete 5 trades", icon: Shield, target: 5, reward: "30 credits" },
  { code: "streak_7", name: "Dedicated Collector", desc: "7-day login streak", icon: Flame, target: 7, reward: "40 credits" },
];

export default function CollectorAchievements({ userId }: Props) {
  const { data: stats } = useQuery({
    queryKey: ["collector-achievement-stats", userId],
    queryFn: async () => {
      const { data: collectibles } = await supabase
        .from("user_collectibles")
        .select("collectible_type")
        .eq("user_id", userId);

      const totalItems = collectibles?.length || 0;
      const uniqueTypes = new Set(collectibles?.map((c: any) => c.collectible_type)).size;

      return { totalItems, uniqueTypes };
    },
  });

  const getProgress = (code: string, target: number) => {
    if (!stats) return 0;
    switch (code) {
      case "first_item":
      case "collector_10":
      case "collector_50":
      case "collector_100":
        return Math.min(stats.totalItems, target);
      case "diversity_5":
        return Math.min(stats.uniqueTypes, target);
      default:
        return 0;
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Collector Achievements - How it works"} steps={[{ title: 'Open', desc: 'Access the Collector Achievements section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Collector Achievements.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-amber-400" />
          <div>
            <h2 className="text-2xl font-bold">Achievements</h2>
            <p className="text-sm text-muted-foreground">Unlock badges and earn credit rewards for milestones</p>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <Badge variant="secondary" className="text-xs">{stats?.totalItems || 0} Items</Badge>
          <Badge variant="secondary" className="text-xs">{stats?.uniqueTypes || 0} Types</Badge>
          <Badge variant="secondary" className="text-xs">
            {achievementDefs.filter(a => getProgress(a.code, a.target) >= a.target).length}/{achievementDefs.length} Unlocked
          </Badge>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {achievementDefs.map(ach => {
          const progress = getProgress(ach.code, ach.target);
          const unlocked = progress >= ach.target;
          return (
            <Card key={ach.code} className={`p-4 transition-all ${unlocked ? "border-amber-500/40 bg-amber-500/5" : "opacity-80"}`}>
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${unlocked ? "bg-amber-500/20" : "bg-muted"}`}>
                  <ach.icon className={`h-5 w-5 ${unlocked ? "text-amber-400" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{ach.name}</h3>
                    {unlocked && <Badge className="text-[10px] bg-amber-500/20 text-amber-400">Unlocked</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{ach.desc}</p>
                  <Progress value={(progress / ach.target) * 100} className="mt-2 h-1.5" />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">{progress}/{ach.target}</span>
                    <span className="text-[10px] text-primary">🎁 {ach.reward}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
    </>
  );
}
