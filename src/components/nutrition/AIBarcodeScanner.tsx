import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanBarcode, Loader2, ArrowLeft, Sparkles, Apple, Flame, Droplets } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";

interface Props { onBack: () => void; }

export default function AIBarcodeScanner({ onBack }: Props) {
  const { credits, spendCredit } = useAICredits();
  const [barcode, setBarcode] = useState("");
  const [productName, setProductName] = useState("");
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const credited = await spendCredit('custom_generation', 'Barcode Scanner');
      if (!credited) throw new Error('Not enough credits (3 required)');
      const { data, error } = await supabase.functions.invoke('nutrition-barcode-scanner', {
        body: { barcode: barcode || undefined, product_name: productName || undefined }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => { setResult(data.product); toast.success("Product analyzed!"); },
    onError: (e: any) => toast.error(e.message || "Error scanning"),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 mb-2 drop-shadow-md">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20">
                <ScanBarcode className="h-5 w-5 text-amber-500" />
              </div>
              AI Barcode Scanner
            </CardTitle>
            <CardDescription>Enter a barcode or product name for instant nutrition data (3 credits)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Barcode Number</Label>
              <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="e.g. 5449000000996" className="bg-background/50" />
            </div>
            <div className="text-center text-xs text-muted-foreground">— OR —</div>
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Coca-Cola 330ml" className="bg-background/50" />
            </div>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || (!barcode && !productName) || !credits || credits.credits_remaining < 3} className="w-full gap-2" size="lg">
              {mutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin" /> Scanning...</> : <><Sparkles className="h-5 w-5" /> Analyze Product (3 credits)</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader><CardTitle>Product Nutrition</CardTitle></CardHeader>
          <CardContent>
            {result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-h-[500px] overflow-y-auto">
                <div className="p-4 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-xl border border-amber-500/20 text-center">
                  <Apple className="h-6 w-6 mx-auto text-amber-500 mb-1" />
                  <p className="text-xl font-black">{result.product_name || "Product"}</p>
                  <p className="text-sm text-muted-foreground">{result.brand || "Unknown brand"}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl border border-red-500/20 text-center">
                    <Flame className="h-4 w-4 mx-auto text-red-500 mb-1" />
                    <p className="text-xs text-muted-foreground">Calories</p>
                    <p className="text-2xl font-black">{result.calories || "—"}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20 text-center">
                    <Droplets className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                    <p className="text-xs text-muted-foreground">Serving</p>
                    <p className="text-lg font-black">{result.serving_size || "100g"}</p>
                  </div>
                </div>

                {result.macros && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">📊 Macronutrients</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Protein", value: result.macros.protein, color: "text-blue-500" },
                        { label: "Carbs", value: result.macros.carbs, color: "text-orange-500" },
                        { label: "Fat", value: result.macros.fat, color: "text-yellow-500" },
                      ].map((m, i) => (
                        <div key={i} className="p-2 bg-muted/50 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">{m.label}</p>
                          <p className={`font-bold ${m.color}`}>{m.value || "—"}g</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.health_score !== undefined && (
                  <div className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 text-center">
                    <p className="text-xs text-muted-foreground">Health Score</p>
                    <p className="text-3xl font-black text-green-500">{result.health_score}/10</p>
                  </div>
                )}

                {result.ingredients_analysis && (
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <h4 className="font-semibold text-sm mb-1">🔬 Ingredients Analysis</h4>
                    <p className="text-xs text-muted-foreground">{result.ingredients_analysis}</p>
                  </div>
                )}

                {result.healthier_alternatives && Array.isArray(result.healthier_alternatives) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">🥗 Healthier Alternatives</h4>
                    {result.healthier_alternatives.map((alt: string, i: number) => (
                      <p key={i} className="text-sm text-muted-foreground p-2 bg-green-500/10 rounded-lg">✅ {alt}</p>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <ScanBarcode className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Product nutrition info will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
