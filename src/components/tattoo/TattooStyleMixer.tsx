import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Blend, Loader2, Sparkles, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";

const STYLES = [
  "Realistic", "Tribal", "Watercolor", "Geometric", "Blackwork",
  "Traditional", "Japanese", "Minimalist", "Neo-Traditional", "Dotwork",
  "Biomechanical", "Chicano", "Sketch", "Surrealist"
];

interface Props { onBack: () => void; }

export const TattooStyleMixer = ({ onBack }: Props) => {
  const { credits, refresh } = useAICredits();
  const navigate = useNavigate();
  const [style1, setStyle1] = useState("");
  const [style2, setStyle2] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const mix = async () => {
    if (!style1 || !style2 || !description) {
      toast.error("Select two styles and describe your tattoo");
      return;
    }
    if (credits.credits_remaining < 12) {
      toast.error("You need 12 credits. Redirecting...");
      setTimeout(() => navigate("/ai-credits"), 1500);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tattoo-ai-tools", {
        body: { type: "style_mix", style1, style2, description },
      });
      if (error) throw error;
      setResult(data.imageUrl);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("ai_tattoo_designs").insert({
          user_id: user.id,
          prompt: `Style Mix: ${style1} + ${style2} - ${description}`,
          style: `${style1}-${style2}`,
          design_url: data.imageUrl,
          credits_used: 12,
        });
      }
      await refresh();
      toast.success("Style mix generated!");
    } catch (e: any) {
      toast.error(e.message || "Error mixing styles");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <Card className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Blend className="h-8 w-8 text-amber-500" />
          <div>
            <h2 className="text-2xl font-black">Tattoo Style Mixer</h2>
            <p className="text-muted-foreground text-sm">Blend two styles into one unique design (12 credits)</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Style 1</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {STYLES.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={style1 === s ? "default" : "outline"}
                  onClick={() => setStyle1(s)}
                  className="text-xs"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Style 2</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {STYLES.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={style2 === s ? "default" : "outline"}
                  onClick={() => setStyle2(s)}
                  className="text-xs"
                  disabled={s === style1}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <Label>Describe Your Tattoo</Label>
          <Textarea
            placeholder="e.g., A lion with a crown surrounded by roses..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={mix} disabled={loading} className="w-full gap-2">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Mixing Styles...</> : <><Sparkles className="h-4 w-4" /> Mix Styles (12 credits)</>}
        </Button>

        {result && (
          <div className="mt-6 space-y-3">
            <img src={result} alt="Mixed tattoo" className="w-full rounded-xl border-2 border-amber-500/50" />
            <Button variant="outline" className="w-full gap-2" onClick={() => {
              const link = document.createElement("a");
              link.href = result;
              link.download = `tattoo-mix-${Date.now()}.png`;
              link.click();
            }}>
              <Download className="h-4 w-4" /> Download Design
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
