import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface StoryNode {
  id: number;
  title: string;
  emoji: string;
  visited: boolean;
  x: number;
  y: number;
}

interface StoryConstellationMapProps {
  stories: Array<{ id: number; title: string; emoji: string }>;
  visitedStories: Set<number>;
}

export function StoryConstellationMap({ stories, visitedStories }: StoryConstellationMapProps) {
  // Position stories in a constellation pattern
  const positions = [
    { x: 20, y: 25 }, { x: 50, y: 15 }, { x: 80, y: 30 },
    { x: 15, y: 65 }, { x: 50, y: 75 }, { x: 85, y: 60 },
  ];

  const nodes: StoryNode[] = stories.slice(0, 6).map((story, i) => ({
    ...story,
    visited: visitedStories.has(story.id),
    x: positions[i]?.x ?? 50,
    y: positions[i]?.y ?? 50,
  }));

  // Draw constellation lines between adjacent stories
  const connections = [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [2, 5], [1, 4]];

  return (
    <>
      <FloatingHowItWorks title={"Story Constellation Map - How it works"} steps={[{ title: 'Open', desc: 'Access the Story Constellation Map section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Story Constellation Map.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-3">
      <h3 className="text-sm font-bold text-purple-100 flex items-center gap-1.5">
        ✨ Story Constellation
      </h3>
      <p className="text-[10px] text-gray-400">{visitedStories.size}/{stories.length} stories explored</p>

      <div className="relative w-full h-48 bg-gradient-to-b from-indigo-950/50 to-purple-950/50 rounded-xl border border-white/10 overflow-hidden">
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {connections.map(([a, b], i) => {
            const from = nodes[a];
            const to = nodes[b];
            if (!from || !to) return null;
            const bothVisited = from.visited && to.visited;
            return (
              <motion.line
                key={i}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={bothVisited ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.1)"}
                strokeWidth={bothVisited ? 0.5 : 0.3}
                strokeDasharray={bothVisited ? "none" : "2,2"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            );
          })}
        </svg>

        {/* Story nodes */}
        {nodes.map((node, i) => (
          <motion.div
            key={node.id}
            className="absolute flex flex-col items-center"
            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
          >
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg ${
                node.visited
                  ? "bg-gradient-to-br from-purple-400 to-pink-400 shadow-purple-500/40"
                  : "bg-white/10 border border-white/20"
              }`}
              animate={node.visited ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
              whileHover={{ scale: 1.3 }}
            >
              {node.visited ? node.emoji : "?"}
            </motion.div>
            <span className={`text-[8px] mt-1 font-medium max-w-[60px] text-center leading-tight ${
              node.visited ? "text-purple-200" : "text-gray-500"
            }`}>
              {node.visited ? node.title : "???"}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
}
