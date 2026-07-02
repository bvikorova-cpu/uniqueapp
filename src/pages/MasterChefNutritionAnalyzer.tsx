import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Apple, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function MasterChefNutritionAnalyzer() {
  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const analyzeNutrition = async () => {
    if (!recipeName.trim() || !ingredients.trim()) {
      toast({ title: "Missing Info", description: "Please enter recipe name and ingredients", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const { data, error } = await supabase.functions.invoke("masterchef-ai", {
        body: { action: "nutrition-analyze", recipeName, ingredients },
      });
      if (error) throw error;
      setAnalysis(data?.analysis || "Analysis unavailable.");
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to analyze nutrition", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <FloatingHowItWorks title="MasterChefNutritionAnalyzer — How it works" steps={[{title:"Open the tool",desc:"Launch MasterChefNutritionAnalyzer from the menu to access its features."},{title:"Explore options",desc:"Browse available cards, filters and personalized recommendations."},{title:"Interact & track",desc:"Log entries, start sessions or run AI scans. Some AI actions cost 3–5 credits."},{title:"Review progress",desc:"Check your dashboard for streaks, achievements and history."}]} />
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/masterchef-subscription")}>← Back</Button>
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
            Nutrition Analyzer
          </h1>
          <p className="text-muted-foreground text-lg">AI-powered nutritional analysis for any recipe</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Apple className="h-5 w-5 text-primary" /> Recipe Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Recipe name (e.g., Chicken Alfredo Pasta)" value={recipeName} onChange={e => setRecipeName(e.target.value)} />
            <textarea className="w-full min-h-[120px] rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground"
              placeholder="List ingredients with quantities, one per line:&#10;200g chicken breast&#10;150g pasta&#10;100ml cream&#10;50g parmesan cheese"
              value={ingredients} onChange={e => setIngredients(e.target.value)} />
            <Button onClick={analyzeNutrition} disabled={loading} size="lg" className="w-full">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" /> Analyze Nutrition</>}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader><CardTitle className="flex items-center gap-2"><Apple className="h-5 w-5 text-green-500" /> Nutritional Analysis</CardTitle></CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{analysis}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
