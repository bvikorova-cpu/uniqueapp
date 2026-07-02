import { motion } from "framer-motion";
import { X, Sparkles, Lock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CollectiblesAlbumProps {
  collectibles: any[];
  collectedIds: string[];
  isVisible: boolean;
  onClose: () => void;
}

const rarityConfig: Record<string, { label: string; color: string; glow: string }> = {
  common: { label: "Common", color: "border-gray-400", glow: "" },
  rare: { label: "Rare", color: "border-blue-500", glow: "shadow-blue-500/20" },
  epic: { label: "Epic", color: "border-purple-500", glow: "shadow-purple-500/30" },
  legendary: { label: "Legendary", color: "border-amber-500", glow: "shadow-amber-500/40" },
};

export function CollectiblesAlbum({ collectibles, collectedIds, isVisible, onClose }: CollectiblesAlbumProps) {
  if (!isVisible) return null;

  const collectedCount = collectibles.filter(c => collectedIds.includes(c.id)).length;
  const progress = collectibles.length > 0 ? Math.round((collectedCount / collectibles.length) * 100) : 0;

  return (
    <>
      <FloatingHowItWorks title={"Collectibles Album - How it works"} steps={[{ title: 'Open', desc: 'Access the Collectibles Album section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Collectibles Album.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-3xl border border-border/50 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h3 className="text-xl font-bold">Collectibles Album</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Collection Progress</span>
            <span className="font-bold">{collectedCount}/{collectibles.length}</span>
          </div>
          <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
            />
          </div>
        </div>

        {/* Grid */}
        {collectibles.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {collectibles.map((item, i) => {
              const isCollected = collectedIds.includes(item.id);
              const rarity = rarityConfig[item.rarity || "common"] || rarityConfig.common;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={isCollected ? { scale: 1.1, rotate: 5 } : {}}
                  className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all ${
                    isCollected
                      ? `${rarity.color} bg-card ${rarity.glow} shadow-lg`
                      : "border-border/30 bg-muted/20 opacity-40"
                  }`}
                >
                  {isCollected ? (
                    <>
                      <span className="text-3xl mb-1">{item.emoji || "✨"}</span>
                      <p className="text-[10px] font-bold text-center leading-tight">{item.name}</p>
                      <span className={`text-[8px] mt-0.5 font-bold ${
                        rarity.label === "Legendary" ? "text-amber-500" :
                        rarity.label === "Epic" ? "text-purple-500" :
                        rarity.label === "Rare" ? "text-blue-500" : "text-muted-foreground"
                      }`}>
                        {rarity.label}
                      </span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-6 w-6 text-muted-foreground/50 mb-1" />
                      <p className="text-[10px] text-muted-foreground">???</p>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Explore castle panoramas to discover hidden collectibles! 🔍</p>
          </div>
        )}

        {/* Rarity legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {Object.entries(rarityConfig).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full border-2 ${val.color}`} />
              <span className="text-xs text-muted-foreground">{val.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
    </>
  );
}
