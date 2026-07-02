import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface ProgressTrackerProps {
  progress: {
    progress_percentage: number;
    current_module: number;
    completed_modules: number[];
    time_spent_minutes: number;
    last_accessed: string;
    completed_at: string | null;
  };
  totalModules: number;
}

export const ProgressTracker = ({ progress, totalModules }: ProgressTrackerProps) => {
  const isCompleted = progress.progress_percentage >= 100;

  return (
    <>
      <FloatingHowItWorks title="How Progress Tracker works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Your Progress</h3>
        {isCompleted && (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-bold text-primary">
              {progress.progress_percentage}%
            </span>
          </div>
          <Progress value={progress.progress_percentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Modules Completed</p>
            <p className="text-2xl font-bold">
              {progress.completed_modules.length}/{totalModules}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Time Spent</p>
            <p className="text-2xl font-bold flex items-center gap-1">
              <Clock className="w-5 h-5" />
              {Math.round(progress.time_spent_minutes / 60)}h
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Last accessed: {new Date(progress.last_accessed).toLocaleDateString()}
          </p>
          {progress.completed_at && (
            <p className="text-xs text-green-600 font-semibold mt-1">
              Completed on: {new Date(progress.completed_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Card>
    </>
    );
};
