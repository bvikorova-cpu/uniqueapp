import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Layers, Flame, Trophy, Award, Calculator, FileText, Users, GraduationCap, Sparkles } from "lucide-react";
import { useEducationStats } from "@/hooks/useEducationStats";
import { Helmet } from "react-helmet-async";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_EDUCATIONHUB_STEPS = [
  { title: 'Browse the tools', desc: 'AI Tutor, Math Solver, Flashcards, Notes, Skill Tree, Study Groups.' },
  { title: 'Track streaks', desc: 'Daily Challenge and streak counter reward consistency.' },
  { title: 'Compete in Leagues', desc: 'Weekly leaderboards move top learners into higher leagues.' },
  { title: 'Collect achievements', desc: "Certificates and badges document what you've mastered." }
];
const __HIW_EDUCATIONHUB = { title: 'Education Hub', intro: 'The starting point for every learning tool.', steps: __HIW_EDUCATIONHUB_STEPS };


const FEATURES = [
  { to: "/education/daily", icon: Flame, title: "Daily Challenge", desc: "5 questions · 50 XP" },
  { to: "/education/flashcards", icon: Layers, title: "Flashcards", desc: "AI decks + spaced repetition" },
  { to: "/education/skill-tree", icon: GraduationCap, title: "Skill Tree", desc: "Unlock topics step by step" },
  { to: "/education/league", icon: Trophy, title: "Weekly League", desc: "Bronze → Diamond" },
  { to: "/education/achievements", icon: Award, title: "Achievements", desc: "Unlock badges" },
  { to: "/education/math-solver", icon: Calculator, title: "Math Solver", desc: "Photo → step-by-step" },
  { to: "/education/tutor", icon: Brain, title: "AI Tutor", desc: "Chat with a personal tutor" },
  { to: "/education/notes", icon: FileText, title: "Notes", desc: "Markdown + AI summaries" },
  { to: "/education/study-groups", icon: Users, title: "Study Groups", desc: "Learn together" },
  { to: "/education/certificates", icon: Sparkles, title: "Certificates", desc: "Earn after passing" },
];

export default function EducationHub() {
  const { data: stats } = useEducationStats();

  return (
    <>
      <Helmet>
        <title>Education Hub · Unique</title>
        <meta name="description" content="Flashcards, AI tutor, daily challenges, leagues, certificates — everything you need to learn faster." />
      </Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2">Education</h1>
          <p className="text-muted-foreground">Learn smarter with AI-powered tools, daily streaks, and gamified progress.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Stat label="XP" value={stats?.currentXP ?? 0} />
          <Stat label="Streak" value={`${stats?.currentStreak ?? 0}🔥`} />
          <Stat label="Best Streak" value={stats?.bestStreak ?? 0} />
          <Stat label="Today" value={stats?.todayCompleted ? "✅" : "—"} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {FEATURES.map((f, i) => (
            <motion.div key={f.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={f.to}>
                <Card className="h-full hover:border-primary/40 hover:shadow-lg transition-all backdrop-blur-xl bg-card/80 cursor-pointer group">
                  <CardContent className="p-5">
                    <f.icon className="w-7 h-7 mb-3 text-primary group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <Card className="backdrop-blur-xl bg-card/80">
      <FloatingHowItWorks title={__HIW_EDUCATIONHUB.title} intro={__HIW_EDUCATIONHUB.intro} steps={__HIW_EDUCATIONHUB.steps} />
      <CardContent className="p-4 text-center">
        <div className="text-2xl font-black">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
