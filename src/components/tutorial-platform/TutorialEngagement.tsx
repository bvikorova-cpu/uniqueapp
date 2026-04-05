import { Card } from "@/components/ui/card";
import { Flame, BarChart3, Trophy } from "lucide-react";

export function TutorialEngagement() {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
      <Card className="p-3 md:p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
          <span className="text-xs md:text-sm font-semibold">Teaching Streak</span>
        </div>
        <p className="text-xl md:text-2xl font-black">12 Days</p>
        <p className="text-[10px] md:text-xs text-muted-foreground">Keep uploading lessons!</p>
      </Card>
      <Card className="p-3 md:p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
          <span className="text-xs md:text-sm font-semibold">Weekly Stats</span>
        </div>
        <p className="text-xl md:text-2xl font-black">+48 Students</p>
        <p className="text-[10px] md:text-xs text-muted-foreground">↑ 23% vs last week</p>
      </Card>
      <Card className="p-3 md:p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
          <span className="text-xs md:text-sm font-semibold">Achievements</span>
        </div>
        <p className="text-xl md:text-2xl font-black">7 / 25</p>
        <p className="text-[10px] md:text-xs text-muted-foreground">3 more to unlock Gold</p>
      </Card>
    </div>
  );
}
