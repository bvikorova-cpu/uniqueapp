import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const MakeupTutorials = () => {
  const [lookDescription, setLookDescription] = useState("");
  const [tutorial, setTutorial] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { credits, refresh } = useAICredits();

  const handleGenerate = async () => {
    if (!lookDescription.trim()) {
      toast.error("Please describe the makeup look");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to use this feature");
        return;
      }

      const { data, error } = await supabase.functions.invoke('beauty-tutorial', {
        body: { lookDescription }
      });

      if (error) throw error;

      setTutorial(data.tutorial);
      refresh();
      toast.success("Tutorial generated!");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to generate tutorial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Makeup Tutorials works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-500" />
          Makeup Tutorial Generator
        </h2>
        <p className="text-muted-foreground mb-6">
          AI creates a step-by-step tutorial for your look. Cost: 2 credits
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="look-description">Describe Your Desired Look</Label>
            <Input
              id="look-description"
              placeholder="e.g., Natural everyday makeup for work"
              value={lookDescription}
              onChange={(e) => setLookDescription(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={loading || (credits?.credits_remaining ?? 0) < 2}
            className="w-full"
          >
            {loading ? "Generating..." : "Generate Tutorial (2 credits)"}
          </Button>

          {credits && (
            <p className="text-sm text-muted-foreground">
              Remaining credits: {credits.credits_remaining}
            </p>
          )}
        </div>
      </Card>

      {tutorial && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-2xl font-bold">{tutorial.title}</h3>
            <div className="flex gap-4 text-sm text-muted-foreground mt-2">
              <span>⏱️ {tutorial.timeNeeded}</span>
              <span>📊 {tutorial.difficulty}</span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-3">📦 Products Needed</h4>
            <ul className="space-y-1">
              {tutorial.productsNeeded?.map((product: any, i: number) => (
                <li key={i} className="text-sm">
                  • {product.product} ({product.category})
                  {product.optional && " - Optional"}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-3">📝 Steps</h4>
            <ol className="space-y-4">
              {tutorial.steps?.map((step: any) => (
                <li key={step.step} className="space-y-1">
                  <div className="font-semibold">
                    {step.step}. {step.title}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  {step.tip && (
                    <p className="text-sm text-green-600">💡 Tip: {step.tip}</p>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {tutorial.proTips && tutorial.proTips.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">✨ Pro Tips</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {tutorial.proTips.map((tip: string, i: number) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
    </>
    );
};
