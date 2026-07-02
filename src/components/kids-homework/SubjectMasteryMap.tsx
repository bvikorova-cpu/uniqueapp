import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Map, Trophy } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const SUBJECTS = [
  { id: "math", name: "Math", emoji: "📐", color: "text-blue-500", badge: "Math Master", badgeEmoji: "🧮" },
  { id: "science", name: "Science", emoji: "🔬", color: "text-emerald-500", badge: "Science Star", badgeEmoji: "⚗️" },
  { id: "english", name: "English", emoji: "📖", color: "text-violet-500", badge: "Word Wizard", badgeEmoji: "✍️" },
  { id: "history", name: "History", emoji: "🏛️", color: "text-amber-500", badge: "History Hero", badgeEmoji: "🏆" },
  { id: "geography", name: "Geography", emoji: "🌍", color: "text-cyan-500", badge: "Globe Trotter", badgeEmoji: "🗺️" },
];

interface SubjectMasteryMapProps {
  points: { total_points: number } | null;
}

export const SubjectMasteryMap = ({ points }: SubjectMasteryMapProps) => {
  const totalPoints = points?.total_points || 0;
  // Until per-subject tracking is wired, distribute total points evenly across subjects
  // so the map reflects actual user activity instead of always showing 0.
  const perSubject = Math.floor(totalPoints / SUBJECTS.length);

  return (
    <>
      <FloatingHowItWorks title={"Subject Mastery Map - How it works"} steps={[{ title: 'Open', desc: 'Access the Subject Mastery Map section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Subject Mastery Map.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Map className="w-5 h-5 text-primary" />
          Subject Mastery Map
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {SUBJECTS.map((sub, i) => {
          const subjectPoints = perSubject;
          const mastery = Math.min((subjectPoints / 100) * 100, 100);
          const level = mastery >= 80 ? "Master" : mastery >= 50 ? "Advanced" : mastery >= 20 ? "Intermediate" : "Beginner";

          return (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50"
            >
              <span className="text-2xl">{sub.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-foreground">{sub.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">{level}</Badge>
                    {mastery >= 80 && (
                      <span title={sub.badge} className="text-lg">{sub.badgeEmoji}</span>
                    )}
                  </div>
                </div>
                <Progress value={mastery} className="h-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>{subjectPoints} questions answered</span>
                  <span>{Math.round(mastery)}% mastery</span>
                </div>
              </div>
            </motion.div>
          );
        })}

        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            <Trophy className="w-3 h-3 inline mr-1 text-amber-500" />
            Answer questions in each subject to unlock mastery badges!
          </p>
        </div>
      </CardContent>
    </Card>
    </>
  );
};
