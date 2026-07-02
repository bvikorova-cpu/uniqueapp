import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Trophy, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const challenges = [
  { id: 1, title: "Cutest Moment", desc: "Share your pet's cutest moment description and get the most votes", reward: "15 Credits", participants: 342, endsIn: "3d 12h", active: true },
  { id: 2, title: "Best Trick", desc: "Describe your pet's best trick for AI analysis", reward: "10 Credits", participants: 218, endsIn: "3d 12h", active: true },
  { id: 3, title: "Healthiest Pet", desc: "Complete all health checks this week", reward: "20 Credits", participants: 156, endsIn: "3d 12h", active: true },
  { id: 4, title: "Translation Master", desc: "Most translations in a single week", reward: "25 Credits", participants: 89, endsIn: "3d 12h", active: true },
];

export default function PetWeeklyChallenges() {
  return (
    <>
      <FloatingHowItWorks title="How Pet Weekly Challenges works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">🎯 Weekly Pet Challenges</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {challenges.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-black text-sm sm:text-base">{c.title}</h3>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px] flex-shrink-0">
                    <Trophy className="h-3 w-3 mr-1" /> {c.reward}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{c.desc}</p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {c.participants}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {c.endsIn}</span>
                </div>
                <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-xs" onClick={() => {
                  const joined = JSON.parse(localStorage.getItem("pet_challenges_joined") || "[]");
                  if (joined.includes(c.id)) { toast.info(`Already joined "${c.title}"`); return; }
                  joined.push(c.id);
                  localStorage.setItem("pet_challenges_joined", JSON.stringify(joined));
                  toast.success(`Joined "${c.title}"! Reward: ${c.reward}`);
                }}>
                  <Sparkles className="h-3 w-3 mr-1" /> Join Challenge
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
    );
}
