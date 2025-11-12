import { Card } from '@/components/ui/card';
import { useBrainDuelCredits } from '@/hooks/useBrainDuelCredits';
import { Brain } from 'lucide-react';

export const BrainDuelCreditsDisplay = () => {
  const { credits, isLoading } = useBrainDuelCredits();

  if (isLoading) return null;

  return (
    <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">Virtual Credits</p>
          <p className="text-2xl font-bold">{credits}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Virtual currency for entertainment only • No real money value
      </p>
    </Card>
  );
};
