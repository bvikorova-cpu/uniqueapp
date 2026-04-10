import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Heart, Sparkles, Star } from "lucide-react";

const mockLeaderboard = [
  { rank: 1, name: "Luna's Owner", pet: "Luna (Golden Retriever)", score: 9850, badge: "🏆" },
  { rank: 2, name: "MeowMaster", pet: "Whiskers (Siamese Cat)", score: 9200, badge: "🥈" },
  { rank: 3, name: "BirdWhisperer", pet: "Kiwi (Cockatiel)", score: 8740, badge: "🥉" },
  { rank: 4, name: "DogDad2025", pet: "Max (German Shepherd)", score: 8100, badge: "⭐" },
  { rank: 5, name: "CatLady", pet: "Mimi (Persian)", score: 7650, badge: "⭐" },
  { rank: 6, name: "PawPatrol", pet: "Buddy (Labrador)", score: 7200, badge: "⭐" },
  { rank: 7, name: "FluffyFan", pet: "Bella (Ragdoll)", score: 6890, badge: "⭐" },
  { rank: 8, name: "PetLover99", pet: "Rocky (Beagle)", score: 6400, badge: "⭐" },
];

export default function PetLeaderboard() {
  return (
    <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">🏆 Pet Leaderboard</h2>
      <Card className="bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border-purple-500/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-purple-400" />
            <p className="text-sm font-bold">Top Pet Owners This Month</p>
            <Badge className="ml-auto bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
              <Sparkles className="h-3 w-3 mr-1" /> Updated Daily
            </Badge>
          </div>
          <div className="space-y-2">
            {mockLeaderboard.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-lg ${entry.rank <= 3 ? "bg-purple-500/10 border border-purple-500/20" : "bg-card/50"}`}
              >
                <span className="text-lg w-8 text-center">{entry.badge}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{entry.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{entry.pet}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm">{entry.score.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">points</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
