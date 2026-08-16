import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Wine } from 'lucide-react';
import { useCookingCredits } from '@/hooks/useCookingCredits';
import { AiMarkdown } from '@/components/common/AiMarkdown';

export const WinePairing = () => {
  const [dishName, setDishName] = useState('');
  const [pairing, setPairing] = useState<string>('');
  const { data: credits } = useCookingCredits();
  const queryClient = useQueryClient();

  const pairingMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-gift-message', {
        body: {
          type: 'wine_pairing',
          prompt: `Dish: ${dishName}. Price range: medium. Suggest pairings in EUR.`,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as any;
    },
    onSuccess: (data) => {
      setPairing(data.message || data.text || data.result || '');
      queryClient.invalidateQueries({ queryKey: ['cooking-credits'] });
      toast.success('Pairing generated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error generating wine pairing');
    },
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Wine className="h-6 w-6 text-primary" />
          Wine &amp; Food Pairing
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
            disabled={!dishName || pairingMutation.isPending || !credits || credits.credits < 3}
            className="w-full"
          >
            {pairingMutation.isPending ? 'Generating...' : 'Find Wine Pairing (3 credits)'}
          </Button>
        </div>
      </Card>

      {pairing && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Recommended Pairings</h3>
          <AiMarkdown content={pairing} />
        </Card>
      )}
    </div>
  );
};
