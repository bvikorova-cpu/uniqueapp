import { motion } from "framer-motion";
import { Flame, Music, Trophy } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  liveShows: number;
  totalConcerts: number;
  topGifts: number;
}

export const ConcertEngagement = ({ liveShows, totalConcerts, topGifts }: Props) => {
  const items = [
    { icon: Flame, label: "Live Now", value: liveShows || "—", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
    { icon: Music, label: "Total Concerts", value: totalConcerts || "—", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
    { icon: Trophy, label: "Gifts Sent", value: topGifts || "—", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  ];

  return (
    <>
      <FloatingHowItWorks title="How Concert Engagement works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="grid grid-cols-3 gap-3 mb-8">
      {items.map((item, i) => (
        <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i }}
          className={`rounded-xl border p-4 text-center ${item.bg}`}>
          <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
          <p className="text-2xl font-black text-foreground">{item.value}</p>
          <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
        </motion.div>
      ))}
    </div>
    </>
    );
};
