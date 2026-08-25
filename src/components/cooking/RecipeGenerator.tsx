import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, Plus, X, ImageIcon, Loader2 } from 'lucide-react';
import { useCookingCredits } from '@/hooks/useCookingCredits';
import { AiMarkdown } from '@/components/common/AiMarkdown';

export const RecipeGenerator = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [recipes, setRecipes] = useState<string>('');
  const { data: credits } = useCookingCredits();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<Record<string, string>>({});
  const [imgLoading, setImgLoading] = useState<string | null>(null);

  const recipeTitles = recipes
    .split('\n')
    .filter((l) => l.trim().startsWith('## '))
    .map((l) => l.replace(/^##\s*/, '').trim())
    .filter(Boolean);

  const generateImage = async (title: string) => {
    if (!credits || credits.credits < 3) {
      toast.error('You need 3 credits to generate a photo.');
      return;
    }
    setImgLoading(title);
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-generation', {
        body: {
          prompt: `Professional food photography of "${title}". Beautifully plated on a ceramic plate, natural side light, shallow depth of field, rustic wooden table, fresh garnish, appetising, high detail, magazine quality.`,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const url = (data as any)?.imageUrl;
      if (!url) throw new Error('No image returned');
      setImages((prev) => ({ ...prev, [title]: url }));
      queryClient.invalidateQueries({ queryKey: ['cooking-credits'] });
      toast.success('Dish photo generated!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate photo');
    } finally {
      setImgLoading(null);
    }
  };

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

          <div className="flex flex-wrap items-center gap-2">
            {ingredients.map((ing, idx) => (
              <div
                key={idx}
                className="inline-flex max-w-full shrink-0 items-center gap-2 rounded-full bg-primary/10 px-3 py-1"
              >
                <span className="truncate text-sm">{ing}</span>
                <button
                  onClick={() => removeIngredient(idx)}
                  aria-label={`Remove ${ing}`}
                  className="shrink-0"
                >
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

          {recipeTitles.length > 0 && (
            <div className="mt-6 space-y-4 border-t pt-4">
              <p className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                Generate a dish photo (3 credits each)
              </p>
              {recipeTitles.map((title) => (
                <div key={title} className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => generateImage(title)}
                    disabled={imgLoading !== null || !!images[title] || !credits || credits.credits < 3}
                  >
                    {imgLoading === title ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin shrink-0" />
                    ) : (
                      <ImageIcon className="h-4 w-4 mr-2 shrink-0" />
                    )}
                    <span className="break-words whitespace-normal">
                      {images[title] ? `Photo ready: ${title}` : `Photo of ${title} (3 credits)`}
                    </span>
                  </Button>
                  {images[title] && (
                    <img
                      src={images[title]}
                      alt={`AI generated photo of ${title}`}
                      loading="lazy"
                      className="w-full rounded-lg border"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
