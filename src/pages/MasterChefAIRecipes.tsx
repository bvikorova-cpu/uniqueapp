import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Sparkles, Plus, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function MasterChefAIRecipes() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [cuisine, setCuisine] = useState("any");
  const [recipe, setRecipe] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (ing: string) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) {
      toast({ title: "Add Ingredients", description: "Please add at least one ingredient", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data, error } = await supabase.functions.invoke("masterchef-ai", {
        body: { action: "ai-recipe", ingredients, cuisine },
      });
      if (error) throw error;
      setRecipe(data?.recipe || "No recipe generated.");
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to generate recipe", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const cuisines = ["any", "Italian", "Japanese", "Mexican", "Indian", "French", "Thai", "Chinese", "Mediterranean"];

  return (
    <>
      <FloatingHowItWorks title="How Master Chef AIRecipes works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" onClick={() => navigate("/masterchef-subscription")}>← Back</Button>
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
            AI Recipe Generator
          </h1>
          <p className="text-muted-foreground text-lg">Enter your ingredients and let AI create the perfect recipe</p>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ChefHat className="h-5 w-5 text-primary" /> Your Ingredients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="e.g. chicken, garlic, lemon..." value={currentIngredient}
                onChange={e => setCurrentIngredient(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addIngredient()} />
              <Button onClick={addIngredient}><Plus className="h-4 w-4" /></Button>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {ingredients.map(ing => (
                <Badge key={ing} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                  {ing}
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeIngredient(ing)} />
                </Badge>
              ))}
              {ingredients.length === 0 && <p className="text-sm text-muted-foreground italic">No ingredients added yet</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Preferred Cuisine</label>
              <div className="flex flex-wrap gap-2">
                {cuisines.map(c => (
                  <Button key={c} size="sm" variant={cuisine === c ? "default" : "outline"}
                    onClick={() => setCuisine(c)} className="capitalize">{c}</Button>
                ))}
              </div>
            </div>

            <Button onClick={generateRecipe} disabled={loading || ingredients.length === 0} size="lg" className="w-full">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Recipe</>}
            </Button>
          </CardContent>
        </Card>

        {recipe && (
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-emerald-500" /> AI Generated Recipe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{recipe}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
    );
}
