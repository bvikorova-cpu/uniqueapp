import { motion } from "framer-motion";
import { BookOpen, Palette, Sparkles, PaintBucket } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface TimelineItem {
  id: string;
  title: string;
  type: "story" | "drawing" | "character" | "coloring";
  date: string;
  imageUrl?: string;
}

interface GalleryTimelineProps {
  items: TimelineItem[];
}

const typeConfig = {
  story: { icon: BookOpen, color: "text-purple-500", bg: "bg-purple-500", label: "Story" },
  drawing: { icon: Palette, color: "text-pink-500", bg: "bg-pink-500", label: "Drawing" },
  character: { icon: Sparkles, color: "text-blue-500", bg: "bg-blue-500", label: "Character" },
  coloring: { icon: PaintBucket, color: "text-orange-500", bg: "bg-orange-500", label: "Coloring" },
};

function formatDate(date: string) {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy");
}

export function GalleryTimeline({ items }: GalleryTimelineProps) {
  const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);

  if (sorted.length === 0) return null;

  return (
    <>
      <FloatingHowItWorks title={"Gallery Timeline - How it works"} steps={[{ title: 'Open', desc: 'Access the Gallery Timeline section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gallery Timeline.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-2xl mx-auto mb-10">
      <h2 className="text-2xl font-bold text-center mb-6">
        📅{" "}
        <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Recent Activity
        </span>
      </h2>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border/50" />

        <div className="space-y-4">
          {sorted.map((item, i) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 pl-2"
              >
                <div className={`w-9 h-9 rounded-full ${config.bg} flex items-center justify-center shrink-0 z-10 shadow-md`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-3 flex items-center gap-3">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {config.label} · {formatDate(item.date)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}
