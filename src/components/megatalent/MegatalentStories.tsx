import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Story = { id: string; name: string; emoji: string; color: string };

const SEED: Story[] = [
  { id: "s1", name: "Anya", emoji: "🎨", color: "from-pink-500 to-purple-500" },
  { id: "s2", name: "Jay", emoji: "🎤", color: "from-orange-500 to-red-500" },
  { id: "s3", name: "Mila", emoji: "💃", color: "from-fuchsia-500 to-rose-500" },
  { id: "s4", name: "Theo", emoji: "🎬", color: "from-blue-500 to-cyan-500" },
  { id: "s5", name: "Sofia", emoji: "✨", color: "from-amber-500 to-yellow-500" },
  { id: "s6", name: "Liam", emoji: "🎧", color: "from-emerald-500 to-teal-500" },
];

const MegatalentStories = () => {
  const [open, setOpen] = useState<Story | null>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    try { setSeen(new Set(JSON.parse(localStorage.getItem("mt_stories_seen") || "[]"))); } catch {}
  }, []);

  const view = (s: Story) => {
    setOpen(s);
    const next = new Set(seen); next.add(s.id); setSeen(next);
    localStorage.setItem("mt_stories_seen", JSON.stringify([...next]));
  };

  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-card/70 border-border/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Talent Stories · 24h</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          <button className="flex flex-col items-center gap-1 shrink-0">
            <div className="h-16 w-16 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <span className="text-[11px] text-muted-foreground">Your story</span>
          </button>
          {SEED.map((s) => (
            <button key={s.id} onClick={() => view(s)} className="flex flex-col items-center gap-1 shrink-0">
              <div className={`h-16 w-16 rounded-full p-[2px] ${seen.has(s.id) ? "bg-muted" : `bg-gradient-to-tr ${s.color}`}`}>
                <div className="h-full w-full rounded-full bg-background flex items-center justify-center text-2xl">{s.emoji}</div>
              </div>
              <span className="text-[11px] truncate max-w-[64px]">{s.name}</span>
            </button>
          ))}
        </div>
      </CardContent>

      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent className="max-w-sm p-0 overflow-hidden border-0">
          {open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`aspect-[9/16] bg-gradient-to-br ${open.color} flex items-center justify-center`}>
              <div className="text-center">
                <div className="text-8xl mb-3">{open.emoji}</div>
                <div className="text-white text-2xl font-black drop-shadow-lg">{open.name}</div>
                <div className="text-white/80 text-sm mt-1">Behind the scenes</div>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MegatalentStories;
