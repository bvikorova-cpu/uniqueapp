import { Card } from "@/components/ui/card";
import { Lightbulb, Wand2, Map, Users, Mic, Image as ImageIcon, Calendar, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const IDEAS = [
  {
    icon: Map,
    title: "Soul Map",
    desc: "Interactive world map pinning every past life with era timeline",
    status: "Coming soon",
    color: "text-emerald-500",
  },
  {
    icon: Mic,
    title: "Voice Regression",
    desc: "Guided audio meditation that reveals your past life through breathwork",
    status: "Premium idea",
    color: "text-violet-500",
  },
  {
    icon: ImageIcon,
    title: "Past Life Portrait",
    desc: "AI-generated portrait of you in your most resonant past life",
    status: "+10 credits",
    color: "text-rose-500",
  },
  {
    icon: Users,
    title: "Soul Tribe Match",
    desc: "Find users who shared your past lives — instant kindred spirit chat",
    status: "Community",
    color: "text-cyan-500",
  },
  {
    icon: Calendar,
    title: "Karma Calendar",
    desc: "Daily karmic insights based on your past life patterns & current astrology",
    status: "Subscription",
    color: "text-amber-500",
  },
  {
    icon: Flame,
    title: "Twin Flame Detector",
    desc: "Compare two people across all past lives — reveal soul contracts",
    status: "+25 credits",
    color: "text-pink-500",
  },
  {
    icon: Wand2,
    title: "Past Life Healing Ritual",
    desc: "Personalized ritual to release karmic blocks from your strongest past life",
    status: "Premium",
    color: "text-purple-500",
  },
  {
    icon: Lightbulb,
    title: "Era Quiz",
    desc: "Fun 10-question quiz that predicts your most likely past life era",
    status: "Free",
    color: "text-yellow-500",
  },
];

export const PastLifeIdeasShowcase = () => {
  return (
    <>
      <FloatingHowItWorks
        title='Past Life Ideas Showcase'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Past Life Ideas Showcase panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
          <Lightbulb className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-black text-base">Tips & Future Features</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Ideas to make your soul journey even more captivating ✨
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {IDEAS.map((idea, i) => (
          <motion.div
            key={idea.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -2 }}
            className="p-3 rounded-xl border border-border/40 bg-muted/10 hover:border-primary/40 hover:bg-muted/20 transition-all"
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
          </motion.div>
        ))}
      </div>
    </Card>
    </>
  );
};
