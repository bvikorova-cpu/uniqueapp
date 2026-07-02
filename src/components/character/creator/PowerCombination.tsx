import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const COMBOS: Record<string, { name: string; emoji: string; rarity: string; description: string }> = {
  "flying+super-strength": { name: "Titan Flight", emoji: "🦸‍♂️", rarity: "Legendary", description: "Fly AND punch through mountains!" },
  "flying+magic-spells": { name: "Sky Sorcerer", emoji: "🧙‍♂️", rarity: "Epic", description: "Cast spells from the clouds!" },
  "flying+invisibility": { name: "Ghost Wing", emoji: "👻", rarity: "Legendary", description: "Invisible AND airborne!" },
  "flying+super-speed": { name: "Sonic Hawk", emoji: "🦅", rarity: "Epic", description: "Faster than light in the sky!" },
  "flying+talking-to-animals": { name: "Bird Whisperer", emoji: "🐦", rarity: "Rare", description: "Command all flying creatures!" },
  "super-strength+magic-spells": { name: "War Mage", emoji: "⚔️", rarity: "Legendary", description: "Muscle AND magic combined!" },
  "super-strength+invisibility": { name: "Phantom Force", emoji: "💀", rarity: "Epic", description: "Invisible super punches!" },
  "super-strength+super-speed": { name: "Meteor Fist", emoji: "☄️", rarity: "Epic", description: "Speed + power = BOOM!" },
  "super-strength+talking-to-animals": { name: "Beast King", emoji: "🦍", rarity: "Rare", description: "Lead the animal army!" },
  "invisibility+magic-spells": { name: "Shadow Mage", emoji: "🌑", rarity: "Legendary", description: "Unseen magical attacks!" },
  "invisibility+super-speed": { name: "Blur Ghost", emoji: "💨", rarity: "Epic", description: "Too fast to see, too sneaky to catch!" },
  "invisibility+talking-to-animals": { name: "Nature Spirit", emoji: "🌿", rarity: "Rare", description: "One with the wild!" },
  "magic-spells+super-speed": { name: "Flash Wizard", emoji: "⚡", rarity: "Epic", description: "Cast spells at light speed!" },
  "magic-spells+talking-to-animals": { name: "Druid Master", emoji: "🌳", rarity: "Rare", description: "Nature magic supreme!" },
  "super-speed+talking-to-animals": { name: "Cheetah Link", emoji: "🐆", rarity: "Rare", description: "Fast as the fastest animal!" },
};

const rarityColors: Record<string, string> = {
  Rare: "from-blue-400 to-blue-600 text-blue-100",
  Epic: "from-purple-400 to-purple-600 text-purple-100",
  Legendary: "from-yellow-400 to-orange-500 text-yellow-100",
};

interface PowerCombinationProps {
  selectedPower: string;
  personality: string;
}

export function PowerCombination({ selectedPower, personality }: PowerCombinationProps) {
  const matchingCombos = useMemo(() => {
    return Object.entries(COMBOS)
      .filter(([key]) => key.includes(selectedPower))
      .map(([key, val]) => ({ key, ...val }))
      .slice(0, 3);
  }, [selectedPower]);

  if (matchingCombos.length === 0) return null;

  return (
    <>
      <FloatingHowItWorks title={"Power Combination - How it works"} steps={[{ title: 'Open', desc: 'Access the Power Combination section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Power Combination.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl p-5 border border-purple-500/30"
    >
      <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
        <span className="text-lg">🔮</span> Power Combinations Unlocked
      </h3>
      <div className="space-y-2">
        <AnimatePresence>
          {matchingCombos.map((combo, i) => (
            <motion.div
              key={combo.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`bg-gradient-to-r ${rarityColors[combo.rarity]} rounded-xl p-3 flex items-center gap-3`}
            >
              <span className="text-2xl">{combo.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm">{combo.name}</p>
                  <span className="text-[9px] bg-black/20 px-1.5 py-0.5 rounded-full font-bold uppercase">
                    {combo.rarity}
                  </span>
                </div>
                <p className="text-[10px] opacity-80">{combo.description}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
    </>
  );
}
