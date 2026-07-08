import { Card } from "@/components/ui/card";
import { Lightbulb, Wand2, Map, Users, Mic, Image as ImageIcon, Calendar, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type Idea = {
  icon: any;
  title: string;
  desc: string;
  status: string;
  color: string;
  href: string;
};

const IDEAS: Idea[] = [
  { icon: Map, title: "Reincarnation timeline", desc: "See every past life pinned on your soul timeline.", status: "Live", color: "text-emerald-500", href: "/reincarnation-timeline" },
  { icon: Mic, title: "Past life regression", desc: "Guided audio meditation that surfaces past lives.", status: "Available", color: "text-violet-500", href: "/reincarnation-social" },
  { icon: ImageIcon, title: "Ancestral portrait", desc: "AI-generated portrait of you in your most resonant past life.", status: "+10 credits", color: "text-rose-500", href: "/dna-memory-network" },
  { icon: Users, title: "Soul tribe match", desc: "Find users who shared your past lives.", status: "Community", color: "text-cyan-500", href: "/reincarnation-social" },
  { icon: Calendar, title: "Karmic debts", desc: "Daily insights based on your past life patterns.", status: "Subscription", color: "text-amber-500", href: "/reincarnation-timeline" },
  { icon: Flame, title: "Twin flame detector", desc: "Compare two souls across all past lives.", status: "+25 credits", color: "text-pink-500", href: "/reincarnation-social" },
  { icon: Wand2, title: "Healing ritual", desc: "Personalized ritual to release karmic blocks.", status: "Premium", color: "text-purple-500", href: "/reincarnation-social" },
  { icon: Lightbulb, title: "Era quiz", desc: "10-question quiz that predicts your past life era.", status: "Free", color: "text-yellow-500", href: "/reincarnation-social" },
];

export const PastLifeIdeasShowcase = () => {
  const navigate = useNavigate();
  return (
    <>
      <FloatingHowItWorks
        title="Past Life explorer"
        intro="Deeper tools to explore your soul's journey."
        steps={[
          { title: "Pick a tool", desc: "Each card opens a live feature — timeline, tribe, ritual and more." },
          { title: "Run the flow", desc: "Some tools cost credits, others are free or subscription-based." },
          { title: "Save your journey", desc: "Insights are stored in your past-life library." },
        ]}
      />
      <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-black text-base">Explore more past-life tools</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Tap a card to open the feature ✨</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {IDEAS.map((idea, i) => (
            <motion.button
              key={idea.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -2 }}
              onClick={() => navigate(idea.href)}
              className="text-left p-3 rounded-xl border border-border/40 bg-muted/10 hover:border-primary/40 hover:bg-muted/20 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-card/60 ${idea.color}`}>
                  <idea.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className="font-bold text-sm truncate">{idea.title}</h4>
                    <span className="text-[9px] font-medium text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      {idea.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{idea.desc}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </Card>
    </>
  );
};
