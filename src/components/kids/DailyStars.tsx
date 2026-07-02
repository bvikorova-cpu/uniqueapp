import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface DailyStarsProps {
  starsCollected: number;
  totalStarsToday: number;
}

export const DailyStars = ({ starsCollected, totalStarsToday }: DailyStarsProps) => {
  const stars = Array.from({ length: totalStarsToday });

  return (
    <>
      <FloatingHowItWorks title={"Daily Stars - How it works"} steps={[{ title: 'Open', desc: 'Access the Daily Stars section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Daily Stars.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gradient-to-r from-yellow-100/95 to-amber-100/95 backdrop-blur-sm border-2 border-yellow-300/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-sm text-yellow-800">Today's Stars</span>
            </div>
            <span className="text-lg font-black text-yellow-600">{starsCollected}/{totalStarsToday}</span>
          </div>

          <div className="flex gap-2 justify-center">
            {stars.map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.1, type: "spring", bounce: 0.6 }}
              >
                <Star
                  className={`w-8 h-8 transition-all ${
                    i < starsCollected
                      ? "text-yellow-400 fill-yellow-400 drop-shadow-lg"
                      : "text-gray-300"
                  }`}
                />
              </motion.div>
            ))}
          </div>

          {starsCollected === 0 && (
            <p className="text-center text-xs text-yellow-700 mt-2 font-medium">
              Complete activities to earn your stars! ⭐
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
