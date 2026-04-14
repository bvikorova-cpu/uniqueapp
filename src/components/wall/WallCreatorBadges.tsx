import { motion } from "framer-motion";
import { Award, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

const badges = [
  { id: "first_post", emoji: "📝", title: "First Post", desc: "Publish your first post", unlocked: true, rarity: "Common" },
  { id: "10_likes", emoji: "❤️", title: "Loved", desc: "Get 10 likes on a single post", unlocked: true, rarity: "Common" },
  { id: "50_posts", emoji: "🔥", title: "Content Machine", desc: "Publish 50 posts", unlocked: true, rarity: "Uncommon" },
  { id: "100_likes", emoji: "💎", title: "Diamond Post", desc: "Get 100 likes on a single post", unlocked: false, rarity: "Rare" },
  { id: "first_viral", emoji: "🚀", title: "Gone Viral", desc: "Post shared 50+ times", unlocked: false, rarity: "Rare" },
  { id: "streak_30", emoji: "🏆", title: "Streak Master", desc: "Maintain a 30-day posting streak", unlocked: false, rarity: "Epic" },
  { id: "top_creator", emoji: "👑", title: "Top Creator", desc: "Reach #1 on weekly leaderboard", unlocked: false, rarity: "Legendary" },
  { id: "influencer", emoji: "⭐", title: "Influencer", desc: "Reach 1,000 followers", unlocked: false, rarity: "Epic" },
  { id: "helper", emoji: "🤝", title: "Community Helper", desc: "Comment on 100 posts", unlocked: true, rarity: "Uncommon" },
  { id: "storyteller", emoji: "📖", title: "Storyteller", desc: "Post 25 stories", unlocked: false, rarity: "Uncommon" },
  { id: "early_bird", emoji: "🌅", title: "Early Bird", desc: "Post before 6 AM", unlocked: true, rarity: "Common" },
  { id: "night_owl", emoji: "🦉", title: "Night Owl", desc: "Post after midnight", unlocked: false, rarity: "Common" },
];

const rarityColors: Record<string, string> = {
  Common: "text-gray-500 bg-gray-500/10",
  Uncommon: "text-green-500 bg-green-500/10",
  Rare: "text-blue-500 bg-blue-500/10",
  Epic: "text-purple-500 bg-purple-500/10",
  Legendary: "text-amber-500 bg-amber-500/10",
};

export default function WallCreatorBadges() {
  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-teal-500/10 border-orange-400/20 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-2">
          <Award className="h-6 w-6 text-orange-500" />
          <div>
            <h3 className="font-bold">Creator Badges</h3>
            <p className="text-xs text-muted-foreground">{unlockedCount}/{badges.length} unlocked</p>
          </div>
        </div>
        <div className="w-full bg-muted/30 rounded-full h-2">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all" style={{ width: `${(unlockedCount / badges.length) * 100}%` }} />
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`p-4 text-center border-border/30 backdrop-blur-md ${badge.unlocked ? "bg-card/80" : "bg-muted/20 opacity-60"}`}>
              <div className="relative inline-block mb-2">
                <span className="text-3xl">{badge.emoji}</span>
                {!badge.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="font-bold text-xs">{badge.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{badge.desc}</p>
              <span className={`inline-block mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${rarityColors[badge.rarity]}`}>{badge.rarity}</span>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
