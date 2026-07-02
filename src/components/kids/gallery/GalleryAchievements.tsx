import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface GalleryAchievementsProps {
  stories: number;
  drawings: number;
  characters: number;
  coloringPages: number;
}

const badges = [
  { emoji: "📝", label: "First Story", req: (s: number) => s >= 1, desc: "Write your first story" },
  { emoji: "📚", label: "Storyteller", req: (s: number) => s >= 5, desc: "Write 5 stories" },
  { emoji: "🎨", label: "First Drawing", req: (_: number, d: number) => d >= 1, desc: "Create your first drawing" },
  { emoji: "🖼️", label: "Art Gallery", req: (_: number, d: number) => d >= 10, desc: "Create 10 drawings" },
  { emoji: "🦸", label: "Hero Creator", req: (_: number, __: number, c: number) => c >= 1, desc: "Create your first character" },
  { emoji: "👥", label: "Character Team", req: (_: number, __: number, c: number) => c >= 5, desc: "Create 5 characters" },
  { emoji: "🌈", label: "Color Master", req: (_: number, __: number, ___: number, p: number) => p >= 3, desc: "Complete 3 coloring pages" },
  { emoji: "🏆", label: "Creative Legend", req: (s: number, d: number, c: number, p: number) => s + d + c + p >= 25, desc: "25 total creations" },
];

export function GalleryAchievements({ stories, drawings, characters, coloringPages }: GalleryAchievementsProps) {
  const earned = badges.filter((b) => b.req(stories, drawings, characters, coloringPages));

  return (
    <>
      <FloatingHowItWorks title={"Gallery Achievements - How it works"} steps={[{ title: 'Open', desc: 'Access the Gallery Achievements section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gallery Achievements.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-4xl mx-auto mb-10">
      <h2 className="text-2xl font-bold text-center mb-6">
        🏅{" "}
        <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
          Achievement Badges
        </span>
        <span className="text-sm font-normal text-muted-foreground ml-2">
          {earned.length}/{badges.length}
        </span>
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {badges.map((badge, i) => {
          const unlocked = badge.req(stories, drawings, characters, coloringPages);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className={`relative rounded-2xl p-4 text-center border transition-all ${
                unlocked
                  ? "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-300 dark:border-amber-700 shadow-md"
                  : "bg-muted/30 border-border/30 opacity-50 grayscale"
              }`}
            >
              <span className="text-3xl block mb-2">{badge.emoji}</span>
              <p className="font-bold text-sm">{badge.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{badge.desc}</p>
              {unlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                >
                  ✓
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
    </>
  );
}
