import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Wine } from 'lucide-react';
import { useCookingCredits } from '@/hooks/useCookingCredits';

export const WinePairing = () => {
  const [dishName, setDishName] = useState('');
  const [pairing, setPairing] = useState<any>(null);
  const { data: credits } = useCookingCredits();

  const pairingMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('suggest-wine-pairing', {
        body: { dish_name: dishName, price_range: 'medium' }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setPairing(data.pairing);
      toast.success('Párovanie vína bolo úspešne vygenerované!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Chyba pri generovaní párovania');
    }
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Wine className="h-6 w-6 text-primary" />
          Párovanie vína s jedlom
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Názov jedla</label>
            <Input
              placeholder="Napríklad: grilovaný losos..."
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
            />
          </div>

          <Button
            onClick={() => pairingMutation.mutate()}
            disabled={!dishName || pairingMutation.isPending || !credits || credits.credits < 1}
            className="w-full"
          >
            {pairingMutation.isPending ? 'Generujem...' : 'Nájdi vhodné víno (1 kredit)'}
          </Button>
        </div>
      </Card>

      {pairing && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Odporúčané víno</h3>
          <div className="space-y-3">
            {pairing.suggestions?.map((wine: any, idx: number) => (
              <div key={idx} className="border-b pb-3 last:border-0">
                <p className="font-semibold">{wine.wine_name}</p>
                <p className="text-sm text-muted-foreground">{wine.type}</p>
                <p className="text-sm mt-1">{wine.reasoning}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
