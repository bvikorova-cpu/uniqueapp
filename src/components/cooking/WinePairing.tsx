import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Wine } from 'lucide-react';
import { useCookingCredits } from '@/hooks/useCookingCredits';
import { invokeOrThrow } from '@/utils/safeInvoke';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const WinePairing = () => {
  const [dishName, setDishName] = useState('');
  const [pairing, setPairing] = useState<any>(null);
  const { data: credits } = useCookingCredits();

  const pairingMutation = useMutation({
    mutationFn: async () => {
      return invokeOrThrow('suggest-wine-pairing', {
        body: { dish_name: dishName, price_range: 'medium' }
      });
    },
    onSuccess: (data) => {
      setPairing(data.pairings);
      toast.success('Wine pairing generated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error generating wine pairing');
    }
  });

  return (
    <>
      <FloatingHowItWorks title="How Wine Pairing works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Wine className="h-6 w-6 text-primary" />
          Wine & Food Pairing
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Dish name</label>
            <Input
              placeholder="e.g., grilled salmon..."
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
            />
          </div>

          <Button
            onClick={() => pairingMutation.mutate()}
            disabled={!dishName || pairingMutation.isPending || !credits || credits.credits < 1}
            className="w-full"
          >
            {pairingMutation.isPending ? 'Generating...' : 'Find Wine Pairing (1 credit)'}
          </Button>
        </div>
      </Card>

      {pairing && pairing.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Recommended Wines</h3>
          <div className="space-y-3">
            {pairing.map((wine: any, idx: number) => (
              <div key={idx} className="border-b pb-3 last:border-0">
                <p className="font-semibold">{wine.drink_name}</p>
                <p className="text-sm text-muted-foreground">{wine.type}</p>
                <p className="text-sm mt-1">{wine.reason}</p>
                {wine.price_range && <p className="text-sm text-muted-foreground mt-1">€{wine.price_range}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
    </>
    );
};
