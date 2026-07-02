import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Store, Loader2, Camera, Star, Sparkles, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function RestaurantAnalyzer() {
  const { credits } = useAICredits();
  const [restaurantName, setRestaurantName] = useState("");
  const [menuImage, setMenuImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-restaurant-menu', {
        body: { restaurantName, menuImageBase64: menuImage }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => { setAnalysis(data.analysis); toast.success("Menu analyzed!"); },
    onError: (error: any) => toast.error(error.message || "Error analyzing menu"),
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setMenuImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <>
      <FloatingHowItWorks title="RestaurantAnalyzer — How it works" steps={[{title:"Open this tool",desc:"Access RestaurantAnalyzer within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-2 gap-6">
      <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                  <Store className="h-5 w-5 text-yellow-500" />
                </div>
                Restaurant Intelligence
              </CardTitle>
              <CardDescription>AI analyzes menus and recommends healthy options (25 credits)</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              {credits ? `${credits.credits_remaining}` : '...'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Restaurant Name *</Label>
            <Input value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} placeholder="e.g. Pizza Hut, McDonald's" className="bg-background/50" />
          </div>

          <div className="space-y-2">
            <Label>Menu Image (optional)</Label>
            <div className="aspect-video rounded-xl border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={() => fileInputRef.current?.click()}>
              {menuImage ? (
                <img src={menuImage} alt="Menu" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="text-center space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload menu photo</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          <Button onClick={() => { if (!restaurantName) { toast.error("Enter restaurant name"); return; } if (!credits || credits.credits_remaining < 25) { toast.error('Need 25 credits'); return; } analyzeMutation.mutate(); }}
            disabled={analyzeMutation.isPending || !restaurantName} className="w-full gap-2" size="lg">
            {analyzeMutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing...</> : <><Sparkles className="h-5 w-5" /> Analyze Menu (25 credits)</>}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>{analysis ? "Recommendations ready" : "Analysis will appear here"}</CardDescription>
        </CardHeader>
        <CardContent>
          {analysis ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-h-[500px] overflow-y-auto">
              <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                <h3 className="font-bold text-lg">{analysis.restaurant_name}</h3>
              </div>

              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" /> Top Recommendations
                  </h4>
                  {analysis.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                      <p className="font-medium text-sm">{rec.dishName}</p>
                      <p className="text-xs text-muted-foreground">{rec.reason}</p>
                      {rec.calories && <p className="text-sm font-bold text-primary mt-1">{rec.calories} cal</p>}
                    </div>
                  ))}
                </div>
              )}

              {analysis.analysis_data && analysis.analysis_data.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">All Dishes</h4>
                  {analysis.analysis_data.slice(0, 10).map((dish: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-muted/50 rounded-lg text-sm border border-border/30">
                      <p className="font-medium">{dish.name}</p>
                      <p className="text-xs text-muted-foreground">~{dish.estimatedCalories} cal | Health: {dish.healthScore}/10</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <Store className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Enter restaurant name to analyze</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
    </>);
}
