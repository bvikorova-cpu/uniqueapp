import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, Plus, X } from 'lucide-react';
import { useCookingCredits } from '@/hooks/useCookingCredits';
import { AiMarkdown } from '@/components/common/AiMarkdown';

export const RecipeGenerator = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [recipes, setRecipes] = useState<string>('');
  const { data: credits } = useCookingCredits();
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-gift-message', {
        body: {
          type: 'recipe_from_ingredients',
          prompt: `Ingredients available: ${ingredients.join(', ')}. Create 3 recipes using mostly these ingredients.`,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as any;
    },
    onSuccess: (data) => {
      setRecipes(data.message || data.text || data.result || '');
      queryClient.invalidateQueries({ queryKey: ['cooking-credits'] });
      toast.success('Recipes generated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error generating recipes');
    },
  });

  const addIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Recipe Generator
        </h2>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add ingredient..."
              value={currentIngredient}
              onChange={(e) => setCurrentIngredient(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
            />
            <Button onClick={addIngredient} size="icon" aria-label="Add ingredient">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="bg-primary/10 px-3 py-1 rounded-full flex items-center gap-2">
                <span className="break-all">{ing}</span>
                <button onClick={() => removeIngredient(idx)} aria-label={`Remove ${ing}`}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={() => generateMutation.mutate()}
            disabled={ingredients.length === 0 || generateMutation.isPending || !credits || credits.credits < 3}
            className="w-full"
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate Recipes (3 credits)'}
          </Button>
        </div>
      </Card>

      {recipes && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Generated Recipes</h3>
          <AiMarkdown content={recipes} />
        </Card>
      )}
    </div>
  );
};
