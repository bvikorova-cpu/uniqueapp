import { motion } from "framer-motion";
import type { Character } from "@/data/kidsCharacters";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface TypingIndicatorProps {
  character: Character;
}

export function TypingIndicator({ character }: TypingIndicatorProps) {
  return (
    <>
      <FloatingHowItWorks title={"Typing Indicator - How it works"} steps={[{ title: 'Open', desc: 'Access the Typing Indicator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Typing Indicator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-end gap-2"
    >
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${character.color} flex items-center justify-center text-lg shadow-lg`}>
        {character.emoji}
      </div>
      <div className={`bg-gradient-to-br ${character.color} rounded-2xl rounded-bl-sm px-4 py-3 shadow-md`}>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-white/80"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
    </>
  );
}
