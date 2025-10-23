import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";

export default function WorkoutMatcher() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          FitFuel Combo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Workout & meal plan matching coming soon! AI pairs your training with perfect nutrition.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
