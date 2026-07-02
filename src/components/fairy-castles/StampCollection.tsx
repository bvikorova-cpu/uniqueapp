import { motion } from "framer-motion";
import { Trophy, Lock, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface StampCollectionProps {
  castles: any[];
  stampedIds: string[];
}

const getFlag = (code: string) => ({ US: "🇺🇸", FR: "🇫🇷", CN: "🇨🇳", HK: "🇭🇰", JP: "🇯🇵" }[code] || "🏰");

export function StampCollection({ castles, stampedIds }: StampCollectionProps) {
  const allComplete = castles.length > 0 && castles.every(c => stampedIds.includes(c.id));

  return (
    <>
      <FloatingHowItWorks title={"Stamp Collection - How it works"} steps={[{ title: 'Open', desc: 'Access the Stamp Collection section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Stamp Collection.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-3xl border border-border/50 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/20 dark:to-orange-950/20 backdrop-blur-sm p-8"
    >
      <div className="text-center mb-8">
        <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-3xl font-black mb-2">
          <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
            Explorer Stamp Collection
          </span>
        </h2>
        <p className="text-muted-foreground">Collect all 6 stamps to become a Master Fairy Explorer!</p>
      </div>

      <div className="flex justify-center gap-4 flex-wrap mb-6">
        {castles.map((castle, i) => {
          const hasStamp = stampedIds.includes(castle.id);
          return (
            <motion.div
              key={castle.id}
              initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              whileHover={hasStamp ? { rotateY: 180, scale: 1.1 } : { scale: 1.05 }}
              className="cursor-default"
              style={{ perspective: 600 }}
            >
              <div
                className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                  hasStamp
                    ? "border-amber-400 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50 shadow-lg shadow-amber-300/30"
                    : "border-border/50 bg-muted/30 opacity-50"
                }`}
              >
                <span className="text-2xl mb-0.5">
                  {hasStamp ? "🏆" : <Lock className="h-5 w-5 text-muted-foreground" />}
                </span>
                <span className="text-xs font-bold">{getFlag(castle.country_code)}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="max-w-sm mx-auto">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{stampedIds.length}/{castles.length} stamps</span>
          <span>{Math.round((stampedIds.length / Math.max(castles.length, 1)) * 100)}%</span>
        </div>
        <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(stampedIds.length / Math.max(castles.length, 1)) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
          />
        </div>
      </div>

      {allComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl">
            <Sparkles className="h-5 w-5" /> 🎉 Master Fairy Explorer Achieved!
          </div>
        </motion.div>
      )}
    </motion.div>
    </>
  );
}
