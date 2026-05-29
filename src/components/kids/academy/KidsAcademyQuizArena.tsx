import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swords, Trophy, Users, Zap, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const QUIZ_CATEGORIES = [
  { id: "animals", name: "Animals", emoji: "🐾", color: "bg-green-500/15 border-green-500/30" },
  { id: "space", name: "Space", emoji: "🚀", color: "bg-blue-500/15 border-blue-500/30" },
  { id: "history", name: "History", emoji: "🏛️", color: "bg-amber-500/15 border-amber-500/30" },
  { id: "nature", name: "Nature", emoji: "🌿", color: "bg-emerald-500/15 border-emerald-500/30" },
  { id: "math", name: "Math", emoji: "🔢", color: "bg-violet-500/15 border-violet-500/30" },
  { id: "geography", name: "Geography", emoji: "🌍", color: "bg-cyan-500/15 border-cyan-500/30" },
];

const WEEKLY_TOURNAMENTS = [
  { name: "Animal Kingdom", emoji: "🦁", participants: 0, startLabel: "Starts Monday", prize: "🏆 Gold Crown" },
  { name: "Space Explorer", emoji: "🌌", participants: 0, startLabel: "Starts Wednesday", prize: "⭐ Shooting Star Badge" },
  { name: "Weekend Challenge", emoji: "🎉", participants: 0, startLabel: "Saturday & Sunday", prize: "🦄 Unicorn Avatar" },
];

export const KidsAcademyQuizArena = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Quiz Categories */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Swords className="w-5 h-5 text-primary" />
            Quiz Arena
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Choose a category and test your knowledge!</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUIZ_CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  selectedCategory === cat.id
                    ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                    : cat.color
                }`}
              >
                <span className="text-3xl block mb-1">{cat.emoji}</span>
                <span className="text-xs font-bold text-foreground">{cat.name}</span>
              </motion.button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              className="flex-1"
              disabled={!selectedCategory}
              onClick={() => {
                const cat = QUIZ_CATEGORIES.find(c => c.id === selectedCategory);
                toast.success(`Starting ${cat?.name} Quiz! ${cat?.emoji}`, {
                  description: "5 questions • +20 XP per correct answer",
                });
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick Quiz (5 questions)
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={!selectedCategory}
              onClick={() => {
                toast.info("Friend challenge coming soon!", {
                  description: "Invite friends to compete in real-time quizzes.",
                });
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              Challenge a Friend
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Tournaments */}
      <Card className="border-2 border-amber-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-amber-500" />
            Weekly Tournaments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {WEEKLY_TOURNAMENTS.map((tournament, i) => (
            <motion.div
              key={tournament.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50 hover:border-amber-500/30 transition-all"
            >
              <motion.span
                className="text-3xl"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
              >
                {tournament.emoji}
              </motion.span>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-foreground">{tournament.name}</h4>
                <p className="text-[11px] text-muted-foreground">
                  {tournament.startLabel} • Prize: {tournament.prize}
                </p>
              </div>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => {
                const joined = JSON.parse(localStorage.getItem("kids_quiz_tournaments_joined") || "[]");
                if (joined.includes(tournament.name)) { toast.info("You are already involved"); return; }
                joined.push(tournament.name);
                localStorage.setItem("kids_quiz_tournaments_joined", JSON.stringify(joined));
                toast.success(`Joined "${tournament.name}"!`);
              }}>
                <Crown className="w-3 h-3 mr-1" />
                Join
              </Button>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
