import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Crown } from "lucide-react";
import { motion } from "framer-motion";

const mockLeaders = [
  { name: "Alex K.", xp: 4850, streak: 14, avatar: "🧑‍🎓" },
  { name: "Sofia M.", xp: 4320, streak: 11, avatar: "👩‍💻" },
  { name: "Marek D.", xp: 3980, streak: 9, avatar: "🧑‍🔬" },
  { name: "Jana P.", xp: 3650, streak: 8, avatar: "👩‍🏫" },
  { name: "Tomáš R.", xp: 3200, streak: 6, avatar: "🧑‍🚀" },
];

const rankIcons = [
  <Crown className="w-4 h-4 text-yellow-500" />,
  <Medal className="w-4 h-4 text-gray-400" />,
  <Medal className="w-4 h-4 text-amber-700" />,
];

export const EducationLeaderboard = () => {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Rebríček študentov
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {mockLeaders.map((leader, i) => (
            <motion.div
              key={leader.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-muted/50
                ${i === 0 ? "bg-yellow-500/10 border border-yellow-500/20" : ""}
              `}
            >
              <div className="w-6 text-center">
                {i < 3 ? rankIcons[i] : (
                  <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                )}
              </div>
              <span className="text-lg">{leader.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{leader.name}</p>
                <p className="text-[10px] text-muted-foreground">🔥 {leader.streak} dní streak</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{leader.xp.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">XP</p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};
