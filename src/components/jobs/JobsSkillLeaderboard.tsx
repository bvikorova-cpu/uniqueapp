import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";

const MOCK_LEADERS = [
  { rank: 1, name: "Alex M.", score: 9850, badge: "👑", skills: ["React", "TypeScript"], streak: 45 },
  { rank: 2, name: "Sarah K.", score: 9420, badge: "🥈", skills: ["Python", "ML"], streak: 38 },
  { rank: 3, name: "James L.", score: 9100, badge: "🥉", skills: ["Java", "AWS"], streak: 32 },
  { rank: 4, name: "Maria G.", score: 8750, badge: "⭐", skills: ["Design", "Figma"], streak: 28 },
  { rank: 5, name: "David C.", score: 8300, badge: "⭐", skills: ["Go", "Docker"], streak: 25 },
  { rank: 6, name: "Emma W.", score: 7900, badge: "🔥", skills: ["Marketing", "SEO"], streak: 22 },
  { rank: 7, name: "Chris P.", score: 7650, badge: "🔥", skills: ["Sales", "CRM"], streak: 20 },
  { rank: 8, name: "Lisa T.", score: 7200, badge: "💪", skills: ["Finance", "Excel"], streak: 18 },
  { rank: 9, name: "Tom R.", score: 6800, badge: "💪", skills: ["PM", "Agile"], streak: 15 },
  { rank: 10, name: "Anna S.", score: 6500, badge: "💪", skills: ["HR", "Recruiting"], streak: 12 },
];

export default function JobsSkillLeaderboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-black">🏆 Skill Leaderboard</h2>
      <p className="text-sm text-muted-foreground">Top candidates ranked by profile completeness, skill assessments & activity</p>

      <div className="space-y-3">
        {MOCK_LEADERS.map((leader, i) => (
          <motion.div key={leader.rank} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className={`border-border/30 ${leader.rank <= 3 ? "bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border-amber-500/30" : "bg-card/80"}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="text-2xl w-10 text-center">{leader.badge}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{leader.name}</p>
                    {leader.rank === 1 && <Crown className="h-4 w-4 text-amber-400" />}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {leader.skills.map(s => (
                      <Badge key={s} variant="outline" className="text-[9px] py-0">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm">{leader.score.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                    <TrendingUp className="h-3 w-3" /> {leader.streak}d streak
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
