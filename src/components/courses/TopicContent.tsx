import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock } from "lucide-react";

interface Topic {
  title: string;
  content: string;
}

interface TopicContentProps {
  topic: Topic;
  topicIndex: number;
  totalTopics: number;
  isCompleted: boolean;
  onComplete: () => void;
  timeSpent?: number;
}

export const TopicContent = ({
  topic,
  topicIndex,
  totalTopics,
  isCompleted,
  onComplete,
  timeSpent = 0,
}: TopicContentProps) => {
  const progress = ((topicIndex + 1) / totalTopics) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {isCompleted && (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
              <CardTitle className="text-2xl">{topic.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{timeSpent} min</span>
            </div>
          </div>
          <CardDescription>
            Téma {topicIndex + 1} z {totalTopics}
          </CardDescription>
          <Progress value={progress} className="h-2 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="space-y-4 leading-relaxed text-muted-foreground whitespace-pre-line">
              {topic.content}
            </div>
          </div>

          {!isCompleted && (
            <Button
              onClick={onComplete}
              className="w-full mt-8"
              size="lg"
            >
              {topicIndex === totalTopics - 1
                ? "Dokončiť tému a pokračovať na test"
                : "Dokončiť tému a pokračovať ďalej"}
            </Button>
          )}

          {isCompleted && (
            <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Táto téma je dokončená
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
