import { motion } from "framer-motion";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface LearningMapProps {
  topics: Array<{
    id: string;
    title: string;
    emoji: string;
    category: string;
  }>;
  completedTopicIds: string[];
}

export const LearningMap = ({ topics, completedTopicIds }: LearningMapProps) => {
  // Show a simplified visual path of topics
  const displayTopics = topics.slice(0, 12); // Show first 12 for the map

  return (
    <>
      <FloatingHowItWorks title="How Learning Map works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl border-2 border-green-200 p-6 mb-8 overflow-hidden"
    >
      <h3 className="text-xl font-bold text-foreground mb-4">🗺️ Learning Map</h3>

      <div className="relative">
        {/* Path SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 200" preserveAspectRatio="none">
          <path
            d="M 30 100 Q 100 30, 175 80 T 325 70 T 475 90 T 580 60"
            fill="none"
            stroke="hsl(var(--muted-foreground) / 0.2)"
            strokeWidth="3"
            strokeDasharray="8 4"
          />
        </svg>

        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 relative z-10">
          {displayTopics.map((topic, i) => {
            const isCompleted = completedTopicIds.includes(topic.id);
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className={`
                  flex flex-col items-center gap-1 p-2 rounded-xl transition-all
                  ${isCompleted ? 'bg-white shadow-md ring-2 ring-green-400' : 'bg-white/50'}
                `}
                style={{ marginTop: i % 2 === 0 ? '0px' : '16px' }}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-xl
                  ${isCompleted ? 'bg-green-100' : 'bg-muted/50 grayscale'}
                `}>
                  {topic.emoji}
                </div>
                <span className="text-[10px] font-medium text-foreground text-center leading-tight truncate w-full">
                  {topic.title.split(' ').slice(0, 2).join(' ')}
                </span>
                {isCompleted && (
                  <span className="text-[9px] text-green-600 font-bold">✓ Done</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
    </>
    );
};
