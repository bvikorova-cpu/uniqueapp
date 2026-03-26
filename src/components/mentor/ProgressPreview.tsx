import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export const ProgressPreview = () => {
  // Start from zero — no progress yet
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-primary" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mb-1">No goals set yet</p>
            <p className="text-xs text-muted-foreground">Start a mentor session to set your first goal!</p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Sessions completed</span>
                <span className="font-bold">0</span>
              </div>
              <Progress value={0} className="h-1.5" />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Goals achieved</span>
                <span className="font-bold">0</span>
              </div>
              <Progress value={0} className="h-1.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
