import { useAchievements, useCheckAchievements } from "@/hooks/useEducationGamification";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_ACHIEVEMENTS_STEPS = [
  { title: 'See what you earned', desc: 'Badges unlock through quizzes, streaks and challenges.' },
  { title: "Find what's next", desc: 'Locked badges show requirements — a natural learning roadmap.' },
  { title: 'Share your wins', desc: 'Post achievements to your profile to inspire friends.' }
];
const __HIW_ACHIEVEMENTS = { title: 'Achievements', intro: "Every milestone you've unlocked while learning.", steps: __HIW_ACHIEVEMENTS_STEPS };


export default function Achievements() {
  const { data: achievements = [], isLoading } = useAchievements();
  const check = useCheckAchievements();

  if (isLoading) return <div className="container mx-auto pt-20 px-4">Loading...</div>;

  return (
    <>
      <Helmet><title>Achievements · Education</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black">Achievements</h1>
          <Button variant="outline" onClick={() => check.mutate()} disabled={check.isPending}>
            {check.isPending ? "Checking..." : "Check unlocks"}
          </Button>
        </div>

        <FloatingHowItWorks title={__HIW_ACHIEVEMENTS.title} intro={__HIW_ACHIEVEMENTS.intro} steps={__HIW_ACHIEVEMENTS.steps} />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {achievements.map((a: any, i: number) => {
            const Icon = (LucideIcons as any)[a.icon] ?? LucideIcons.Trophy;
            return (
              <motion.div key={a.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                <Card className={`backdrop-blur-xl ${a.unlocked ? "bg-primary/10 border-primary/40" : "bg-card/60 opacity-60 grayscale"}`}>
                  <CardContent className="p-4 text-center">
                    <Icon className={`w-10 h-10 mx-auto mb-2 ${a.unlocked ? "text-primary" : "text-muted-foreground"}`} />
                    <h3 className="font-bold text-sm">{a.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                    <p className="text-xs text-primary font-bold mt-2">+{a.xp_reward} XP</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
