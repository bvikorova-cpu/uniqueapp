import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface GalleryHeroProps {
  totalCreations: number;
  hasGoldPass: boolean;
}

const floatingItems = [
  { emoji: "🎨", left: 3, top: 12 },
  { emoji: "📖", left: 92, top: 8 },
  { emoji: "✨", left: 7, top: 75 },
  { emoji: "🦸", left: 90, top: 70 },
  { emoji: "🖌️", left: 2, top: 45 },
  { emoji: "⭐", left: 95, top: 40 },
  { emoji: "🌈", left: 88, top: 85 },
  { emoji: "🎭", left: 5, top: 88 },
];

export function GalleryHero({ totalCreations, hasGoldPass }: GalleryHeroProps) {
  return (
    <>
      <FloatingHowItWorks title={"Gallery Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Gallery Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gallery Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative text-center py-14 overflow-hidden">
      {floatingItems.map((item, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl md:text-3xl pointer-events-none select-none opacity-50"
          style={{ left: `${item.left}%`, top: `${item.top}%` }}
          animate={{ y: [0, -12, 0], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
          transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        >
          {item.emoji}
        </motion.span>
      ))}

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto mb-5 w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 flex items-center justify-center shadow-2xl shadow-purple-400/30"
        >
          <span className="text-4xl">🎨</span>
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-black mb-3">
          <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent">
            My Magic Gallery
          </span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-4">
          Your creative portfolio — {totalCreations} magical creations and counting! ✨
        </p>

        {hasGoldPass && (
          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white gap-1 text-sm px-4 py-1.5">
            <Crown className="w-4 h-4" /> Gold Pass Artist
          </Badge>
        )}
      </motion.div>
    </div>
    </>
  );
}
