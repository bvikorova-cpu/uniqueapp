import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Plus } from "lucide-react";
import { useIQCredits } from "@/hooks/useIQCredits";

export const IQCreditsDisplay = () => {
  const { credits, isLoading, purchaseCredits } = useIQCredits();

  if (isLoading) return null;

  return (
    <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Available Credits</p>
            <p className="text-3xl font-bold">{credits}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => purchaseCredits(10)}
            variant="outline"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            10 Credits - €5
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => purchaseCredits(20)}
          >
            <Plus className="mr-2 h-4 w-4" />
            20 Credits - €7
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => purchaseCredits(50)}
          >
            <Plus className="mr-2 h-4 w-4" />
            50 Credits - €10
          </Button>
        </div>
      </div>
    </Card>
  );
};
