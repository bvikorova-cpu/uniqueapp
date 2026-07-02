import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2, TrendingUp, ChefHat, Sparkles, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function FoodScanner() {
  const queryClient = useQueryClient();
  const { credits } = useAICredits();
  const [image, setImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scanMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      const { data, error } = await supabase.functions.invoke('scan-food', { body: { imageBase64 } });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setScanResult(data.scan);
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      toast.success("Food scanned successfully!");
    },
    onError: (error: any) => toast.error(error.message || "Error scanning food"),
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleScan = () => {
    if (!image) { toast.error("Please upload an image first"); return; }
    if (!credits || credits.credits_remaining < 10) { toast.error('You need 10 AI credits. Please purchase credits.'); return; }
    scanMutation.mutate(image);
  };

  return (
    <>
      <FloatingHowItWorks title="FoodScanner — How it works" steps={[{title:"Open this tool",desc:"Access FoodScanner within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-2 gap-6">
      <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <Camera className="h-5 w-5 text-blue-500" />
                </div>
                Smart Food Scanner
              </CardTitle>
              <CardDescription>AI-powered nutritional analysis from photos (10 credits)</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <ChefHat className="h-3 w-3 text-primary" />
              {credits ? `${credits.credits_remaining}` : '...'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
            onClick={() => fileInputRef.current?.click()}
          >
            {image ? (
              <img src={image} alt="Food" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="text-center space-y-3">
                <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 mx-auto w-fit">
                  <Upload className="h-10 w-10 text-blue-500" />
                </div>
                <p className="text-muted-foreground text-sm">Click to upload food image</p>
              </div>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          <Button onClick={handleScan} disabled={scanMutation.isPending || !image || !credits || credits.credits_remaining < 10} className="w-full gap-2" size="lg">
            {scanMutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin" /> Scanning...</> : <><Sparkles className="h-5 w-5" /> Scan Food (10 credits)</>}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Scan Results</CardTitle>
          <CardDescription>{scanResult ? "Nutritional breakdown" : "Scan results will appear here"}</CardDescription>
        </CardHeader>
        <CardContent>
          {scanResult ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                <h3 className="font-bold text-lg">{scanResult.food_name}</h3>
                <p className="text-3xl font-black text-primary mt-1">{scanResult.calories} <span className="text-sm font-medium text-muted-foreground">calories</span></p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Protein", value: scanResult.protein, color: "from-red-500/10 to-rose-500/10", textColor: "text-red-500" },
                  { label: "Carbs", value: scanResult.carbs, color: "from-amber-500/10 to-yellow-500/10", textColor: "text-amber-500" },
                  { label: "Fats", value: scanResult.fats, color: "from-blue-500/10 to-indigo-500/10", textColor: "text-blue-500" },
                ].map((macro) => (
                  <div key={macro.label} className={`text-center p-3 bg-gradient-to-br ${macro.color} rounded-xl border border-border/40`}>
                    <p className={`text-2xl font-black ${macro.textColor}`}>{macro.value}g</p>
                    <p className="text-xs text-muted-foreground">{macro.label}</p>
                  </div>
                ))}
              </div>

              {scanResult.healthier_alternatives && scanResult.healthier_alternatives.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" /> Healthier Alternatives
                  </h4>
                  {scanResult.healthier_alternatives.map((alt: any, idx: number) => (
                    <div key={idx} className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                      <p className="font-medium text-sm">{alt.name}</p>
                      <p className="text-xs text-muted-foreground">{alt.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Upload and scan food to see results</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
    </>);
}
