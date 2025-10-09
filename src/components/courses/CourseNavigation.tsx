import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Topic {
  title: string;
  content: string;
}

interface CourseNavigationProps {
  topics: Topic[];
  currentTopic: number;
  completedTopics: number[];
  onTopicSelect: (index: number) => void;
}

export const CourseNavigation = ({
  topics,
  currentTopic,
  completedTopics,
  onTopicSelect,
}: CourseNavigationProps) => {
  const canAccessTopic = (index: number) => {
    // Can access if it's the current topic, already completed, or the next topic
    return (
      index === currentTopic ||
      completedTopics.includes(index) ||
      index === currentTopic + 1 ||
      completedTopics.includes(index - 1)
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Obsah kurzu</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-2">
            {topics.map((topic, index) => {
              const isCompleted = completedTopics.includes(index);
              const isCurrent = currentTopic === index;
              const isAccessible = canAccessTopic(index);

              return (
                <button
                  key={index}
                  onClick={() => isAccessible && onTopicSelect(index)}
                  disabled={!isAccessible}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                    isCurrent && "bg-primary/10 border-primary border",
                    isCompleted && !isCurrent && "bg-muted",
                    !isAccessible && "opacity-50 cursor-not-allowed",
                    isAccessible && !isCurrent && "hover:bg-muted/50"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : !isAccessible ? (
                    <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-primary"
                  )}>
                    {topic.title}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
