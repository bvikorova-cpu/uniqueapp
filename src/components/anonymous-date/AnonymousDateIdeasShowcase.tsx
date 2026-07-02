import { Card } from "@/components/ui/card";
import { Lightbulb, Mic, Video, Calendar, Gift, Music, Brain, Lock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const IDEAS = [
  {
    icon: Mic,
    title: "Voice-Only Speed Dates",
    desc: "5-minute timed voice rooms — match purely by voice & vibe before chatting",
    status: "+5 credits",
    color: "text-rose-500",
  },
  {
    icon: Video,
    title: "Blurred Video Reveal",
    desc: "Gradually unblur each other's video over the 7 days — slow burn intimacy",
    status: "Premium",
    color: "text-violet-500",
  },
  {
    icon: Brain,
    title: "AI Personality Twin",
    desc: "AI analyzes your messages and finds users with the most compatible mind",
    status: "+10 credits",
    color: "text-cyan-500",
  },
  {
    icon: Calendar,
    title: "Virtual Date Nights",
    desc: "Scheduled themed events — movie nights, trivia, cooking together remotely",
    status: "Weekly",
    color: "text-amber-500",
  },
  {
    icon: Gift,
    title: "Anonymous Gift Box",
    desc: "Send digital gifts — songs, poems, AI-art — without breaking anonymity",
    status: "+10 credits",
    color: "text-pink-500",
  },
  {
    icon: Music,
    title: "Shared Playlist Match",
    desc: "Spotify integration — match by music taste, build a playlist together",
    status: "Premium",
    color: "text-emerald-500",
  },
  {
    icon: MapPin,
    title: "Same-City Mode",
    desc: "Optional toggle to match with people nearby for real-life reveal dates",
    status: "Free toggle",
    color: "text-blue-500",
  },
  {
    icon: Lock,
    title: "Compatibility Vault",
    desc: "Both unlock each other's secret answers only after 50+ messages exchanged",
    status: "Subscription",
    color: "text-purple-500",
  },
];

export const AnonymousDateIdeasShowcase = () => {
  return (
    <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
      <FloatingHowItWorks
        title={"Anonymous Date Ideas Showcase"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-pink-500/20 to-primary/20">
          <Lightbulb className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-black text-base">Tips & Future Features</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Ideas to make anonymous love even more magical 💖
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
  );
};
