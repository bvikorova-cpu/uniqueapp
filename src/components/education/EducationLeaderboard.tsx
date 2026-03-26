import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Crown } from "lucide-react";
import { motion } from "framer-motion";

const rankIcons = [
  <Crown className="w-4 h-4 text-yellow-500" />,
  <Medal className="w-4 h-4 text-gray-400" />,
  <Medal className="w-4 h-4 text-amber-700" />,
];

export const EducationLeaderboard = () => {
  // Empty state - no mock data, starts from zero for every user
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Student Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mb-1">No students ranked yet</p>
            <p className="text-xs text-muted-foreground">Complete quizzes to appear on the leaderboard!</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
