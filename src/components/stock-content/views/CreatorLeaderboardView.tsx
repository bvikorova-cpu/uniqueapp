import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Medal, TrendingUp, Download, Star, Users } from "lucide-react";

interface CreatorLeaderboardViewProps {
  onBack: () => void;
}

const mockCreators = [
  { rank: 1, name: "Alex Rivera", avatar: "🎨", downloads: 45230, revenue: 12450, rating: 4.9, assets: 342, badge: "Diamond" },
  { rank: 2, name: "Sarah Chen", avatar: "📸", downloads: 38100, revenue: 10200, rating: 4.8, assets: 278, badge: "Platinum" },
  { rank: 3, name: "Marcus Webb", avatar: "🖌️", downloads: 31500, revenue: 8900, rating: 4.9, assets: 195, badge: "Platinum" },
  { rank: 4, name: "Luna Park", avatar: "✨", downloads: 28700, revenue: 7600, rating: 4.7, assets: 167, badge: "Gold" },
  { rank: 5, name: "David Kim", avatar: "📷", downloads: 24100, revenue: 6800, rating: 4.8, assets: 234, badge: "Gold" },
  { rank: 6, name: "Emma Stone", avatar: "🎭", downloads: 21300, revenue: 5900, rating: 4.6, assets: 145, badge: "Gold" },
  { rank: 7, name: "James Liu", avatar: "🌅", downloads: 18700, revenue: 5200, rating: 4.7, assets: 189, badge: "Silver" },
  { rank: 8, name: "Nina Torres", avatar: "🎬", downloads: 16200, revenue: 4500, rating: 4.5, assets: 112, badge: "Silver" },
  { rank: 9, name: "Chris Murphy", avatar: "🖼️", downloads: 14800, revenue: 3900, rating: 4.6, assets: 98, badge: "Silver" },
  { rank: 10, name: "Yuki Tanaka", avatar: "🎪", downloads: 12500, revenue: 3400, rating: 4.8, assets: 76, badge: "Bronze" },
];

const getRankStyle = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
  if (rank === 2) return "bg-gradient-to-r from-slate-300/20 to-gray-400/20 border-slate-400/30";
  if (rank === 3) return "bg-gradient-to-r from-amber-700/20 to-orange-800/20 border-amber-700/30";
  return "";
};

const getBadgeColor = (badge: string) => {
  switch (badge) {
    case "Diamond": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    case "Platinum": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "Gold": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "Silver": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    default: return "bg-amber-700/10 text-amber-600 border-amber-700/20";
  }
};

export function CreatorLeaderboardView({ onBack }: CreatorLeaderboardViewProps) {
  const [period, setPeriod] = useState("monthly");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-500" /> Creator Leaderboard</h2>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {mockCreators.slice(0, 3).map((c) => (
          <Card key={c.rank} className={`p-4 text-center ${getRankStyle(c.rank)} border`}>
            <div className="text-4xl mb-2">{c.rank === 1 ? "🥇" : c.rank === 2 ? "🥈" : "🥉"}</div>
            <div className="text-3xl mb-1">{c.avatar}</div>
            <h3 className="font-bold text-sm">{c.name}</h3>
            <Badge variant="secondary" className={`mt-1 text-[10px] ${getBadgeColor(c.badge)}`}>{c.badge}</Badge>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Download className="w-3 h-3" />{c.downloads.toLocaleString()}
              </p>
              <p className="text-xs font-semibold text-green-400">€{c.revenue.toLocaleString()}</p>
            </div>
          </Card>
        ))}
      </div>

      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="alltime">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value={period}>
          <Card className="divide-y divide-border">
            {mockCreators.map((c) => (
              <div key={c.rank} className={`flex items-center gap-4 p-4 ${c.rank <= 3 ? getRankStyle(c.rank) : ""}`}>
                <span className="text-lg font-black w-8 text-center">{c.rank}</span>
                <span className="text-2xl">{c.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">{c.name}</h4>
                    <Badge variant="secondary" className={`text-[10px] ${getBadgeColor(c.badge)}`}>{c.badge}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.assets} assets</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold flex items-center gap-1"><Download className="w-3 h-3" />{c.downloads.toLocaleString()}</p>
                  <p className="text-xs text-green-400">€{c.revenue.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-semibold">{c.rating}</span>
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
