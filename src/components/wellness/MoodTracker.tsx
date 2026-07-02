import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { 
  Smile, Meh, Frown, Heart, Sun, Cloud, CloudRain, Sparkles, TrendingUp
} from "lucide-react";

interface MoodEntry {
  mood: number;
  note: string;
  timestamp: Date;
}

const moodOptions = [
  { value: 1, icon: Frown, label: "Terrible", color: "text-red-400", bg: "bg-red-500/10" },
  { value: 2, icon: CloudRain, label: "Bad", color: "text-orange-400", bg: "bg-orange-500/10" },
  { value: 3, icon: Cloud, label: "Neutral", color: "text-muted-foreground", bg: "bg-muted/30" },
  { value: 4, icon: Meh, label: "Good", color: "text-blue-400", bg: "bg-blue-500/10" },
  { value: 5, icon: Smile, label: "Great", color: "text-green-400", bg: "bg-green-500/10" },
  { value: 6, icon: Sun, label: "Amazing", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { value: 7, icon: Heart, label: "Wonderful", color: "text-pink-400", bg: "bg-pink-500/10" },
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
    const entry: MoodEntry = { mood: selectedMood, note, timestamp: new Date() };
    setRecentMoods((prev) => [entry, ...prev.slice(0, 6)]);
    onSaveMood?.(entry);
    setSaved(true);
    setTimeout(() => { setSaved(false); setSelectedMood(null); setNote(""); }, 2000);
  };

  const averageMood = recentMoods.length > 0
    ? (recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <FloatingHowItWorks title="MoodTracker — How it works" steps={[{title:"Open this tool",desc:"Access MoodTracker within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-primary/5 to-violet-500/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-500/10">
              <Sparkles className="h-5 w-5 text-pink-400" />
            </div>
            How are you feeling today?
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <div className="flex flex-wrap justify-center gap-3">
            {moodOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedMood === option.value;
              return (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(option.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all border ${
                    isSelected
                      ? `${option.bg} ring-2 ring-primary border-primary/30`
                      : "border-border/50 bg-card/60 hover:border-primary/20"
                  }`}
                >
                  <Icon className={`h-7 w-7 ${option.color}`} />
                  <span className="text-[10px] font-semibold">{option.label}</span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedMood !== null && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <Textarea
                  placeholder="Add a note about your mood (optional)..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="resize-none backdrop-blur-sm"
                  rows={3}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Button onClick={handleSave} disabled={selectedMood === null || saved} className="w-full active:scale-[0.97] transition-transform">
            {saved ? (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Saved!
              </motion.span>
            ) : "Save Mood"}
          </Button>
        </CardContent>
      </Card>

      {recentMoods.length > 0 && (
        <Card className="relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Mood Trend
              </span>
              {averageMood && (
                <Badge variant="outline" className="text-xs">Average: {averageMood}/7</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-end justify-between h-32 gap-2">
              {recentMoods.slice(0, 7).reverse().map((entry, index) => {
                const height = (entry.mood / 7) * 100;
                const option = moodOptions.find((o) => o.value === entry.mood);
                return (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.1, type: "spring" }}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-primary/50 to-primary/80 relative group cursor-pointer"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {option && <option.icon className={`h-5 w-5 ${option.color}`} />}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Earlier</span>
              <span>Now</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MoodTracker;
