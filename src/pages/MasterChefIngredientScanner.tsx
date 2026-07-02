import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanLine, Upload, Loader2, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function MasterChefIngredientScanner() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!imagePreview) return;
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data, error } = await supabase.functions.invoke("masterchef-ai", {
        body: { action: "scan-ingredients", image: imagePreview },
      });
      if (error) throw error;
      setAnalysis(data?.analysis || "Could not identify ingredients.");
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to analyze image", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Master Chef Ingredient Scanner works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/masterchef-subscription")}>← Back</Button>

        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
            Ingredient Scanner
          </h1>
          <p className="text-muted-foreground text-lg">Upload a photo of your ingredients and get AI-powered dish suggestions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5 text-primary" /> Upload Ingredient Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
            
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Ingredients" className="w-full max-h-[400px] object-contain rounded-lg" />
                <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => { setImagePreview(null); setAnalysis(null); }}>
                  Change Photo
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium mb-1">Click to upload or take a photo</p>
                <p className="text-sm text-muted-foreground">Supported: JPG, PNG, WebP</p>
              </div>
            )}

            <Button onClick={analyzeImage} disabled={!imagePreview || loading} size="lg" className="w-full">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...</> : <><ScanLine className="h-4 w-4 mr-2" /> Scan & Identify Ingredients</>}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <Card className="border-purple-500/30 bg-purple-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ScanLine className="h-5 w-5 text-purple-500" /> AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{analysis}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
    );
}
