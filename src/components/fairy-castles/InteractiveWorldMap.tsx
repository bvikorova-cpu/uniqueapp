import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Castle {
  id: string;
  name: string;
  country_code: string;
  park_name: string;
}

interface InteractiveWorldMapProps {
  castles: Castle[];
  stampedIds: string[];
  visitedIds: string[];
  onCastleClick: (castleId: string) => void;
}

const countryPositions: Record<string, { x: number; y: number; label: string }> = {
  US: { x: 20, y: 42, label: "USA" },
  FR: { x: 48, y: 35, label: "France" },
  JP: { x: 82, y: 40, label: "Japan" },
  CN: { x: 76, y: 45, label: "China" },
  HK: { x: 78, y: 52, label: "Hong Kong" },
};

export function InteractiveWorldMap({ castles, stampedIds, visitedIds, onCastleClick }: InteractiveWorldMapProps) {
  // Group castles by country
  const castlesByCountry: Record<string, Castle[]> = {};
  castles.forEach(c => {
    if (!castlesByCountry[c.country_code]) castlesByCountry[c.country_code] = [];
    castlesByCountry[c.country_code].push(c);
  });

  return (
    <>
      <FloatingHowItWorks title={"Interactive World Map - How it works"} steps={[{ title: 'Open', desc: 'Access the Interactive World Map section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Interactive World Map.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative w-full max-w-4xl mx-auto rounded-3xl border border-border/50 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/30 dark:to-cyan-950/30 backdrop-blur-sm p-8 overflow-hidden"
    >
      <h2 className="text-2xl font-bold text-center mb-2 flex items-center justify-center gap-2">
        🗺️ Choose Your Destination
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-8">Click a castle pin to start exploring</p>

      {/* Simple world map outline */}
      <div className="relative w-full aspect-[2/1] bg-gradient-to-b from-blue-100/50 to-blue-200/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl overflow-hidden">
        {/* Grid lines for map feel */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 50">
          {[10, 20, 30, 40].map(y => (
            <line key={`h-${y}`} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeWidth="0.2" />
          ))}
          {[20, 40, 60, 80].map(x => (
            <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="50" stroke="currentColor" strokeWidth="0.2" />
          ))}
        </svg>

        {/* Dotted connection lines between castles */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50">
          {Object.values(countryPositions).map((pos, i, arr) => {
            if (i === arr.length - 1) return null;
            const next = arr[i + 1];
            return (
              <line
                key={i}
                x1={pos.x}
                y1={pos.y}
                x2={next.x}
                y2={next.y}
                stroke="currentColor"
                strokeWidth="0.15"
                strokeDasharray="0.8 0.4"
                className="text-muted-foreground/30"
              />
            );
          })}
        </svg>

        {/* Castle pins */}
        {Object.entries(castlesByCountry).map(([code, countryCastles]) => {
          const pos = countryPositions[code];
          if (!pos) return null;

          const allCompleted = countryCastles.every(c => stampedIds.includes(c.id));
          const anyVisited = countryCastles.some(c => visitedIds.includes(c.id));

          return (
            <motion.button
              key={code}
              className="absolute group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -100%)" }}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const target = countryCastles[0];
                if (target) onCastleClick(target.id);
              }}
            >
              {/* Pulse ring for completed */}
              {allCompleted && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-amber-400/30"
                  animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 40, height: 40, left: -12, top: -4 }}
                />
              )}

              {/* Pin */}
              <div className={`text-3xl transition-all ${allCompleted ? "drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" : ""}`}>
                {allCompleted ? "🏆" : anyVisited ? "🏰" : "📍"}
              </div>

              {/* Label */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  allCompleted
                    ? "bg-amber-500 text-white"
                    : anyVisited
                    ? "bg-blue-500 text-white"
                    : "bg-card/80 text-foreground border border-border/50"
                }`}>
                  {pos.label} ({countryCastles.length})
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
    </>
  );
}
