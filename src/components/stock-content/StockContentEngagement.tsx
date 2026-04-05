import { Card } from "@/components/ui/card";
import { Flame, BarChart3, Trophy } from "lucide-react";

export function StockContentEngagement() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Streak */}
      <Card className="p-4 md:p-5 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Creator Streak</p>
            <p className="text-2xl font-black">7 Days</p>
            <p className="text-[10px] text-orange-400">Upload daily to earn bonus</p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <Card className="p-4 md:p-5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">This Week</p>
            <p className="text-2xl font-black">+234</p>
            <p className="text-[10px] text-blue-400">Downloads on your content</p>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-4 md:p-5 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Achievements</p>
            <p className="text-2xl font-black">12/30</p>
            <p className="text-[10px] text-amber-400">Top Seller badge unlocked!</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
