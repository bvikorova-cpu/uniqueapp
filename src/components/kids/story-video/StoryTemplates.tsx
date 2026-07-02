import { motion } from 'framer-motion';
import { Rocket, Crown, TreePine, Fish, Ghost, Sword } from 'lucide-react';
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface StoryTemplatesProps {
  onSelect: (theme: string) => void;
}

const TEMPLATES = [
  { icon: '🐉', label: 'Dragon Quest', theme: 'A brave little dragon who is afraid of flying learns to soar above the clouds with help from a wise owl', color: 'from-red-500/20 to-orange-500/20', border: 'border-red-300' },
  { icon: '🚀', label: 'Space Adventure', theme: 'A curious astronaut cat travels to a candy planet where rivers flow with chocolate and mountains are made of cookies', color: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-300' },
  { icon: '👸', label: 'Fairy Tale', theme: 'A princess who loves science invents a machine that makes flowers sing and trees dance in the enchanted garden', color: 'from-pink-500/20 to-purple-500/20', border: 'border-pink-300' },
  { icon: '🦕', label: 'Dinosaur World', theme: 'A friendly baby dinosaur gets lost in a magical forest and makes friends with fireflies who guide him home', color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-300' },
  { icon: '🧙', label: 'Magic School', theme: 'A young wizard accidentally turns the school library books into flying birds and must catch them all before sunset', color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-300' },
  { icon: '🌊', label: 'Ocean Mystery', theme: 'A little mermaid discovers a sunken treasure chest that contains a map leading to the lost city of singing whales', color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-300' },
];

export const StoryTemplates = ({ onSelect }: StoryTemplatesProps) => {
  return (
    <>
      <FloatingHowItWorks title={"Story Templates - How it works"} steps={[{ title: 'Open', desc: 'Access the Story Templates section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Story Templates.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">💡</span>
        <h3 className="text-lg font-bold text-purple-800">Quick Start Templates</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {TEMPLATES.map((t, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(t.theme)}
            className={`bg-gradient-to-br ${t.color} border-2 ${t.border} rounded-xl p-4 text-left hover:shadow-lg transition-shadow`}
          >
            <div className="text-3xl mb-2">{t.icon}</div>
            <div className="font-semibold text-purple-800 text-sm">{t.label}</div>
            <div className="text-xs text-purple-500 mt-1 line-clamp-2">{t.theme.substring(0, 60)}...</div>
          </motion.button>
        ))}
      </div>
    </div>
    </>
  );
};
