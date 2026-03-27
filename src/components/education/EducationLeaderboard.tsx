import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

export const EducationLeaderboard = () => {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Student Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-7 h-7 text-yellow-500/40" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">No students ranked yet</p>
            <p className="text-xs text-muted-foreground">Complete quizzes to appear on the leaderboard!</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
