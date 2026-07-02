import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, TrendingUp, Calendar, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface GoalProgressCardProps {
  goal: any;
  currentValue: number;
  categoryRank?: number;
  dailyAverage?: number;
  onGoalDeleted: () => void;
}

export function GoalProgressCard({ 
  goal, 
  currentValue, 
  categoryRank,
  dailyAverage,
  onGoalDeleted 
}: GoalProgressCardProps) {
  const getGoalIcon = (type: string) => {
    switch (type) {
      case "votes": return Trophy;
      case "rank": return Target;
      case "daily_average": return TrendingUp;
      default: return Target;
    }
  };

  const getGoalLabel = (type: string) => {
    switch (type) {
      case "votes": return "Total Votes Goal";
      case "rank": return "Ranking Goal";
      case "daily_average": return "Daily Average Goal";
      default: return "Goal";
    }
  };

  const getCurrentValueForGoal = () => {
    switch (goal.goal_type) {
      case "votes": return currentValue;
      case "rank": return categoryRank || 0;
      case "daily_average": return dailyAverage || 0;
      default: return 0;
    }
  };

  const actualValue = getCurrentValueForGoal();
  const targetValue = goal.target_value;
  
  // For rank, lower is better, so we need to reverse the calculation
  const progress = goal.goal_type === "rank" 
    ? Math.min(100, Math.max(0, ((targetValue / Math.max(actualValue, 1)) * 100)))
    : Math.min(100, (actualValue / targetValue) * 100);

  const isCompleted = goal.goal_type === "rank" 
    ? actualValue <= targetValue && actualValue > 0
    : actualValue >= targetValue;

  const daysRemaining = Math.ceil(
    (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysRemaining < 0;

  const GoalIcon = getGoalIcon(goal.goal_type);

  const handleDeleteGoal = async () => {
    try {
      const { error } = await supabase
        .from("sponsor_goals" as any)
        .delete()
        .eq("id", goal.id);

      if (error) throw error;

      toast.success("Goal deleted successfully");
      onGoalDeleted();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Goal Progress Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Goal Progress Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Goal Progress Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <GoalIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">{getGoalLabel(goal.goal_type)}</CardTitle>
              <CardDescription>
                {isCompleted ? "Goal Achieved! 🎉" : `${daysRemaining} days remaining`}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            ) : isOverdue ? (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <AlertCircle className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            ) : (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Active
              </Badge>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-900 border-purple-500/50">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete Goal?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    This will permanently delete this goal. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-black/40 text-white border-purple-500/30">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteGoal}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Goal
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="font-semibold text-white">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Current vs Target */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-black/20 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Current</div>
            <div className="text-xl font-bold text-white">
              {goal.goal_type === "rank" && "#"}
              {actualValue.toFixed(goal.goal_type === "daily_average" ? 1 : 0)}
            </div>
          </div>
          <div className="p-3 bg-black/20 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Target</div>
            <div className="text-xl font-bold text-white">
              {goal.goal_type === "rank" && "#"}
              {targetValue}
            </div>
          </div>
          <div className="p-3 bg-black/20 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Remaining</div>
            <div className={`text-xl font-bold ${
              isCompleted ? 'text-green-400' : 'text-orange-400'
            }`}>
              {isCompleted ? "✓" : goal.goal_type === "rank" 
                ? `${Math.max(0, actualValue - targetValue)}` 
                : `${Math.max(0, targetValue - actualValue)}`}
            </div>
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-2 text-sm text-gray-400 p-3 bg-black/20 rounded-lg">
          <Calendar className="h-4 w-4" />
          <span>
            Deadline: {new Date(goal.deadline).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </span>
        </div>

        {/* Motivational Message */}
        {!isCompleted && !isOverdue && (
          <div className="text-sm text-gray-300 p-3 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/30">
            {goal.goal_type === "rank" 
              ? `You need to move up ${Math.max(0, actualValue - targetValue)} ${actualValue - targetValue === 1 ? 'position' : 'positions'} to reach your goal!`
              : goal.goal_type === "daily_average"
              ? `Increase your daily average by ${Math.max(0, (targetValue - actualValue)).toFixed(1)} votes to hit your target!`
              : `You're ${progress.toFixed(0)}% of the way there! Keep pushing to reach ${targetValue} votes!`
            }
          </div>
        )}

        {isCompleted && (
          <div className="text-sm text-green-300 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
            🎉 Congratulations! You've achieved your goal. Set a new one to keep growing!
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
