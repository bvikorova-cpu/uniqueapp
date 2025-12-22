import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Smile, 
  Meh, 
  Frown, 
  Heart, 
  Sun, 
  Cloud, 
  CloudRain,
  Sparkles,
  TrendingUp
} from "lucide-react";

interface MoodEntry {
  mood: number;
  note: string;
  timestamp: Date;
}

const moodOptions = [
  { value: 1, icon: Frown, label: "Veľmi zle", color: "text-red-500" },
  { value: 2, icon: CloudRain, label: "Zle", color: "text-orange-500" },
  { value: 3, icon: Cloud, label: "Neutrálne", color: "text-gray-500" },
  { value: 4, icon: Meh, label: "Dobre", color: "text-blue-500" },
  { value: 5, icon: Smile, label: "Výborne", color: "text-green-500" },
  { value: 6, icon: Sun, label: "Fantasticky", color: "text-yellow-500" },
  { value: 7, icon: Heart, label: "Úžasne", color: "text-pink-500" },
];

interface MoodTrackerProps {
  onSaveMood?: (entry: MoodEntry) => void;
}

export const MoodTracker = ({ onSaveMood }: MoodTrackerProps) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);

  const handleSave = () => {
    if (selectedMood === null) return;

    const entry: MoodEntry = {
      mood: selectedMood,
      note,
      timestamp: new Date(),
    };

    setRecentMoods((prev) => [entry, ...prev.slice(0, 6)]);
    onSaveMood?.(entry);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
      setSelectedMood(null);
      setNote("");
    }, 2000);
  };

  const averageMood = recentMoods.length > 0
    ? (recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Ako sa dnes cítite?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Selection */}
          <div className="flex flex-wrap justify-center gap-3">
            {moodOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedMood === option.value;

              return (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(option.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                    isSelected
                      ? "bg-primary/20 ring-2 ring-primary"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <Icon className={`h-8 w-8 ${option.color}`} />
                  <span className="text-xs font-medium">{option.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Note Input */}
          <AnimatePresence>
            {selectedMood !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Textarea
                  placeholder="Poznámka k vašej nálade (voliteľné)..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={selectedMood === null || saved}
            className="w-full"
          >
            {saved ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Uložené!
              </motion.span>
            ) : (
              "Uložiť náladu"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Moods Graph */}
      {recentMoods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Vývoj nálady
              </span>
              {averageMood && (
                <span className="text-sm font-normal text-muted-foreground">
                  Priemer: {averageMood}/7
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-32 gap-2">
              {recentMoods.slice(0, 7).reverse().map((entry, index) => {
                const height = (entry.mood / 7) * 100;
                const option = moodOptions.find((o) => o.value === entry.mood);

                return (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex-1 rounded-t-lg bg-gradient-to-t from-primary/50 to-primary relative group`}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {option && <option.icon className={`h-5 w-5 ${option.color}`} />}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Staršie</span>
              <span>Teraz</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MoodTracker;
