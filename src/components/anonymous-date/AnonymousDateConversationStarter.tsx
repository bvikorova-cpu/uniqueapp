import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircleHeart, RefreshCw, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const STARTERS = [
  "If your life had a soundtrack, what 3 songs would be on it?",
  "What's the most spontaneous thing you've ever done?",
  "Describe your perfect Sunday morning — go.",
  "What's a small thing that makes you ridiculously happy?",
  "If you could master any skill instantly, what would it be?",
  "What's a book or movie that changed how you think?",
  "Tell me a memory that still makes you smile.",
  "What's your love language — show me, don't tell me.",
  "If we met in another life, where would it be?",
  "What's something you're proud of but rarely talk about?",
  "Coffee or tea — and what does that say about you?",
  "What's a dream you haven't told anyone yet?",
];

const STORAGE_KEY = "anon_date_daily_starter";

export const AnonymousDateConversationStarter = () => {
  const { toast } = useToast();
  const [starter, setStarter] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) {
        setStarter(parsed.text);
        return;
      }
    }
    rotate(true);
  }, []);

  const rotate = (persist = false) => {
    const next = STARTERS[Math.floor(Math.random() * STARTERS.length)];
    setStarter(next);
    if (persist) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: new Date().toDateString(), text: next })
      );
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(starter);
    setCopied(true);
    toast({ title: "Copied!", description: "Paste it into your next chat 💬" });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="p-5 bg-gradient-to-br from-pink-500/10 via-card/80 to-primary/10 backdrop-blur-xl border-pink-500/20">
      <FloatingHowItWorks
        title={"Anonymous Date Conversation Starter"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-pink-500/30 to-primary/30">
          <MessageCircleHeart className="h-4 w-4 text-pink-400" />
        </div>
        <h3 className="font-black text-base">Daily Conversation Starter</h3>
        <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/15 px-2 py-0.5 rounded-full">
          Free
        </span>
      </div>

      <motion.div
        key={starter}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-background/40 border border-border/40 mb-3"
      >
        <p className="text-sm font-medium leading-relaxed italic">"{starter}"</p>
      </motion.div>

      <div className="flex gap-2">
        <Button onClick={copy} size="sm" className="flex-1 gap-2">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button onClick={() => rotate(false)} size="sm" variant="outline" className="gap-2">
          <RefreshCw className="h-3 w-3" />
          New
        </Button>
      </div>
    </Card>
  );
};
