import { Card } from '@/components/ui/card';
import { useCookingCredits } from '@/hooks/useCookingCredits';
import { Coins } from 'lucide-react';

export const CookingCreditsDisplay = () => {
  const { data: credits, isLoading } = useCookingCredits();

  if (isLoading) return null;

  return (
    <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
      <div className="flex items-center gap-2">
        <Coins className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">Available Credits</p>
          <p className="text-2xl font-bold">{credits?.credits || 0}</p>
        </div>
      </div>
    </Card>
  );
};
