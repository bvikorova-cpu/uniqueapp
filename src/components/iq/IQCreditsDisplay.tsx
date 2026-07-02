import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Plus } from "lucide-react";
import { useIQCredits } from "@/hooks/useIQCredits";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export const IQCreditsDisplay = () => {
  const { credits, isLoading, purchaseCredits } = useIQCredits();

  if (isLoading) return null;

  return (
    <>
      <FloatingHowItWorks title="How IQCredits Display works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-primary/5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Available Credits</p>
            <p className="text-3xl font-bold">{credits}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
          <Button
            onClick={() => purchaseCredits(10)}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <Plus className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            10 Credits - €5
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => purchaseCredits(20)}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <Plus className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            20 Credits - €7
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => purchaseCredits(50)}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <Plus className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            50 Credits - €10
          </Button>
        </div>
      </div>
    </Card>
    </>
    );
};
