import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Shield, Eye } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface CharacterPreview3DProps {
  characterName: string;
  generatedImage: string | null;
  placeholderImage: string;
  selections: {
    hair: { emoji: string; name: string };
    power: { emoji: string; name: string };
    eyes: { emoji: string; name: string };
    costume: { emoji: string; name: string };
    personality: { emoji: string; name: string };
    skin: { emoji: string; name: string };
    gender: { emoji: string; name: string };
    age: { emoji: string; name: string };
  };
  isGenerating: boolean;
}

export function CharacterPreview3D({
  characterName,
  generatedImage,
  placeholderImage,
  selections,
  isGenerating,
}: CharacterPreview3DProps) {
  const stats = [
    { icon: <Zap className="h-3 w-3" />, label: "Power", value: selections.power.name, emoji: selections.power.emoji },
    { icon: <Shield className="h-3 w-3" />, label: "Costume", value: selections.costume.name, emoji: selections.costume.emoji },
    { icon: <Eye className="h-3 w-3" />, label: "Eyes", value: selections.eyes.name, emoji: selections.eyes.emoji },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Character Preview3 D - How it works"} steps={[{ title: 'Open', desc: 'Access the Character Preview3 D section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Character Preview3 D.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      className="sticky top-24"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Outer glow */}
      <div className="relative">
        <motion.div
          className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl opacity-30 blur-xl"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        <div className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 rounded-3xl p-6 border border-purple-500/30 overflow-hidden">
          {/* Animated background grid */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />
          </div>

          {/* Character name */}
          <motion.h2
            className="text-center text-2xl md:text-3xl font-black mb-4 relative z-10"
            key={characterName}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
              {characterName || "Your Hero"}
            </span>
          </motion.h2>

          {/* Image container with rotating border */}
          <div className="relative mx-auto max-w-xs mb-5">
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-2xl"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ padding: "2px" }}
            />
            <div className="relative rounded-2xl overflow-hidden bg-gray-900">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="h-16 w-16 text-yellow-400 mx-auto mb-3" />
                      </motion.div>
                      <p className="text-purple-200 font-semibold animate-pulse">
                        Crafting magic...
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.img
                    key={generatedImage || "placeholder"}
                    src={generatedImage || placeholderImage}
                    alt={characterName || "Hero Preview"}
                    className="w-full h-auto aspect-square object-cover"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Corner sparkles */}
            {generatedImage && (
              <>
                <motion.span
                  className="absolute -top-2 -left-2 text-xl"
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 20, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✨
                </motion.span>
                <motion.span
                  className="absolute -top-2 -right-2 text-xl"
                  animate={{ scale: [1.3, 1, 1.3], rotate: [0, -20, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  ⭐
                </motion.span>
              </>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/10"
              >
                <span className="text-lg">{stat.emoji}</span>
                <p className="text-white text-[10px] font-semibold truncate">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Attribute tags */}
          <div className="flex flex-wrap gap-1.5 justify-center relative z-10">
            {[
              { ...selections.hair, label: "Hair" },
              { ...selections.age, label: "Age" },
              { ...selections.personality, label: "" },
              { ...selections.gender, label: "" },
              { ...selections.skin, label: "Skin" },
            ].map((attr, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="bg-white/10 text-white/80 text-[10px] font-medium px-2 py-1 rounded-full border border-white/10"
              >
                {attr.emoji} {attr.label ? `${attr.label}: ` : ""}{attr.name}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
}
