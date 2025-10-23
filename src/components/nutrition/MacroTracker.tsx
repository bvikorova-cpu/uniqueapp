import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function MacroTracker() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Macro Balance Coach
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Daily macro tracking coming soon! Track your protein, carbs, and fats with AI optimization.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
