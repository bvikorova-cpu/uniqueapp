import { motion } from 'framer-motion';
import { RefreshCw, Plus, Wand2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface StoryRemixProps {
  currentTheme: string;
  onRemix: (theme: string) => void;
}

const REMIX_OPTIONS = [
  { icon: Plus, label: 'Create Sequel', suffix: '- continue the story with a new adventure and surprising twist', color: 'text-blue-600 bg-blue-50' },
  { icon: RefreshCw, label: 'Different Style', suffix: '- retell in a completely different art style (anime, watercolor, pixel art)', color: 'text-green-600 bg-green-50' },
  { icon: Wand2, label: 'Add Magic', suffix: '- add magical elements, talking animals, and enchanted objects', color: 'text-purple-600 bg-purple-50' },
  { icon: Copy, label: 'Extend Story', suffix: '- add 4 more scenes to continue and expand the story', color: 'text-amber-600 bg-amber-50' },
];

export const StoryRemix = ({ currentTheme, onRemix }: StoryRemixProps) => {
  if (!currentTheme) return null;

  return (
    <>
      <FloatingHowItWorks title={"Story Remix - How it works"} steps={[{ title: 'Open', desc: 'Access the Story Remix section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Story Remix.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
      <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
        <RefreshCw className="w-5 h-5" />
        Remix This Story
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {REMIX_OPTIONS.map((opt, i) => (
          <motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-3"
              onClick={() => onRemix(`${currentTheme} ${opt.suffix}`)}
            >
              <opt.icon className={`w-4 h-4 flex-shrink-0`} />
              <span className="text-sm">{opt.label}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
};
