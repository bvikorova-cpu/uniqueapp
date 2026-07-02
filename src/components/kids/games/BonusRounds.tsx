import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface BonusRoundsProps {
  onPlay: (theme: string) => void;
}

const BONUS_EVENTS = [
  { id: "holiday", name: "Holiday Special", emoji: "🎄", color: "from-green-400 to-red-400", timeLeft: "2d 14h" },
  { id: "space", name: "Space Mission", emoji: "🪐", color: "from-indigo-400 to-purple-500", timeLeft: "5d 8h" },
  { id: "underwater", name: "Deep Sea Quest", emoji: "🐙", color: "from-cyan-400 to-blue-500", timeLeft: "1d 3h" },
];

export function BonusRounds({ onPlay }: BonusRoundsProps) {
  return (
    <>
      <FloatingHowItWorks title={"Bonus Rounds - How it works"} steps={[{ title: 'Open', desc: 'Access the Bonus Rounds section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Bonus Rounds.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-pink-500" /> Bonus Events
      </h3>

      <div className="space-y-2">
        {BONUS_EVENTS.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-r ${event.color} rounded-xl p-3 shadow-md cursor-pointer`}
            onClick={() => onPlay(event.id)}
          >
            <div className="flex items-center gap-3">
              <motion.span
                className="text-2xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                {event.emoji}
              </motion.span>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white">{event.name}</h4>
                <div className="flex items-center gap-1 text-[10px] text-white/80">
                  <Clock className="h-3 w-3" />
                  {event.timeLeft} left
                </div>
              </div>
              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full font-bold">
                2x XP
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
}
