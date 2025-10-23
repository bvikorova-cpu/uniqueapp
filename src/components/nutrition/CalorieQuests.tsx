import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function CalorieQuests() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Calorie Quest - Gamification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Gamified calorie tracking coming soon! Complete daily quests, earn XP, level up, and compete in challenges.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
