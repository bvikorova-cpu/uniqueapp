import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, Plus, X } from 'lucide-react';
import { useCookingCredits } from '@/hooks/useCookingCredits';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const RecipeGenerator = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [recipes, setRecipes] = useState<any>(null);
  const { data: credits } = useCookingCredits();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-recipe-from-ingredients', {
        body: { ingredients, dietary_preferences: [] }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setRecipes(data.recipes);
      toast.success('Recipes generated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error generating recipes');
    }
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
    <>
      <FloatingHowItWorks title="How Recipe Generator works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
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
              onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
            />
            <Button onClick={addIngredient} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="bg-primary/10 px-3 py-1 rounded-full flex items-center gap-2">
                <span>{ing}</span>
                <button onClick={() => removeIngredient(idx)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={() => generateMutation.mutate()}
            disabled={ingredients.length === 0 || generateMutation.isPending || !credits || credits.credits < 1}
            className="w-full"
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate Recipes (1 credit)'}
          </Button>
        </div>
      </Card>

      {recipes && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Generated Recipes</h3>
          <div className="space-y-4">
            {recipes.recipes?.map((recipe: any, idx: number) => (
              <div key={idx} className="border-b pb-4 last:border-0">
                <h4 className="font-semibold text-lg">{recipe.name}</h4>
                <p className="text-muted-foreground">{recipe.description}</p>
                <div className="mt-2 text-sm">
                  <p><strong>Prep time:</strong> {recipe.prep_time}</p>
                  <p><strong>Difficulty:</strong> {recipe.difficulty}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
    </>
    );
};
