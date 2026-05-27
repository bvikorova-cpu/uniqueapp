import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMentorPremium } from "@/hooks/useMentorRouter";
import {
  Brain, Target, Theater, Users, Bell, ListChecks, Sparkles, Repeat, UserCog, FileText, Mic2, BookHeart, Crown, ScrollText, Award, MessageCircle, Lightbulb, Flame,
} from "lucide-react";

const FEATURES = [
  { to: "/ai-mentor/tools/memory", icon: Brain, title: "Memory", desc: "Coach remembers across sessions" },
  { to: "/ai-mentor/tools/skills", icon: Award, title: "Skills", desc: "20 named skills + progress" },
  { to: "/ai-mentor/tools/personality", icon: UserCog, title: "Personality", desc: "Big Five assessment" },
  { to: "/ai-mentor/tools/roleplay", icon: Theater, title: "Role-play", desc: "12 scenarios to practice" },
  { to: "/ai-mentor/tools/feedback360", icon: Users, title: "360° Feedback", desc: "Anonymous peer review" },
  { to: "/ai-mentor/tools/nudges", icon: Bell, title: "Daily Nudges", desc: "AI reminders" },
  { to: "/ai-mentor/tools/goals", icon: Target, title: "SMART Goals", desc: "AI-generated milestones" },
  { to: "/ai-mentor/tools/reflections", icon: Lightbulb, title: "Reflections", desc: "Prompts by mood" },
  { to: "/ai-mentor/tools/habits", icon: Repeat, title: "Habits", desc: "Streaks + freeze tokens" },
  { to: "/ai-mentor/tools/coach", icon: MessageCircle, title: "Coach Styles", desc: "4 personalities" },
  { to: "/ai-mentor/tools/summaries", icon: ScrollText, title: "Summaries", desc: "Session insights" },
  { to: "/ai-mentor/tools/voice-journal", icon: Mic2, title: "Voice Journal", desc: "Emotion detection" },
  { to: "/ai-mentor/tools/cbt", icon: BookHeart, title: "CBT Programs", desc: "21-day rewires" },
  { to: "/ai-mentor", icon: Sparkles, title: "Classic Chat", desc: "Original 4-area chat" },
  { to: "/ai-mentor/premium", icon: Crown, title: "Premium", desc: "Unlock everything" },
];

export default function MentorHub() {
  const { data: sub } = useMentorPremium();

  return (
    <>
      <Helmet><title>Personal Mentor Hub · Unique</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-1 flex items-center gap-2">
              <Flame className="w-7 h-7 text-primary" /> Personal Mentor
            </h1>
            <p className="text-muted-foreground">All 15 AI coaching tools in one place.</p>
          </div>
          {sub?.subscribed ? (
            <span className="text-xs font-bold bg-primary/15 text-primary px-3 py-1 rounded-full">
              ✓ {Object.keys(sub.areas ?? {}).length} coach{Object.keys(sub.areas ?? {}).length === 1 ? "" : "es"} active
            </span>
          ) : (
            <Button asChild><Link to="/ai-mentor/premium"><Crown className="w-4 h-4 mr-1" /> Get Premium</Link></Button>
          )}
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {FEATURES.map((f, i) => (
            <motion.div key={f.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
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
