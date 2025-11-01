import { Card } from '@/components/ui/card';
import { useAstrologyCredits } from '@/hooks/useAstrologyCredits';
import { Sparkles } from 'lucide-react';

export const AstrologyCreditsDisplay = () => {
  const { credits, isLoading } = useAstrologyCredits();

  if (isLoading) return null;

  return (
    <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <div>
          <p className="text-sm text-muted-foreground">Astrology Credits</p>
          <p className="text-2xl font-bold">{credits?.credits_remaining || 0}</p>
        </div>
      </div>
    </Card>
  );
};
