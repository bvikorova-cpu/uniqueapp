import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, Clock, Eye, Globe, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const SAMPLE_CAPSULES = [
  { id: "1", title: "Letter to My Future Wife", type: "letter", author: "Alex M.", likes: 342, daysUntil: 730, isPublic: true },
  { id: "2", title: "Message for My 40th Birthday", type: "text", author: "Sarah K.", likes: 218, daysUntil: 1825, isPublic: true },
  { id: "3", title: "Video for My Unborn Child", type: "video", author: "Michael R.", likes: 567, daysUntil: 3650, isPublic: true },
  { id: "4", title: "Class of 2025 Reunion", type: "text", author: "Emma T.", likes: 189, daysUntil: 365, isPublic: true },
  { id: "5", title: "Note to My Retired Self", type: "letter", author: "David L.", likes: 445, daysUntil: 7300, isPublic: true },
  { id: "6", title: "Family Heritage Archive", type: "video", author: "Lisa W.", likes: 312, daysUntil: 5475, isPublic: true },
];

export const CapsuleGallery = ({ onBack }: { onBack: () => void }) => {
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "text" | "video" | "letter">("all");

  const toggle = (id: string) => setLiked(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const filtered = filter === "all" ? SAMPLE_CAPSULES : SAMPLE_CAPSULES.filter(c => c.type === filter);

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Hub</Button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Community Gallery
        </h2>
        <div className="flex gap-1">
          {(["all", "text", "video", "letter"] as const).map(f => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" className="text-xs capitalize" onClick={() => setFilter(f)}>{f}</Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((capsule, i) => (
          <motion.div key={capsule.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/40 hover:border-primary/30 transition-all group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">{capsule.type}</span>
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <h3 className="font-bold text-sm mb-1">{capsule.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">by {capsule.author}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.floor(capsule.daysUntil / 365)}y left</span>
                    <button onClick={() => toggle(capsule.id)} className="flex items-center gap-1 hover:text-pink-500 transition-colors">
                      <Heart className={`w-3 h-3 ${liked.has(capsule.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                      {capsule.likes + (liked.has(capsule.id) ? 1 : 0)}
                    </button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => toast.success(`"${capsule.title}" — by ${capsule.author}. Unlocks in ${Math.floor(capsule.daysUntil / 365)} years.`, { duration: 4000 })}><Eye className="w-3 h-3 mr-1" /> View</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
