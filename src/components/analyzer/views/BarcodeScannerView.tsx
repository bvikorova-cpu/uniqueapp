import { useState } from "react";
import { ArrowLeft, Coins, Loader2, ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useAnalyzerCredits } from "@/hooks/useAnalyzerCredits";
import { reserveAnalyzerCredits } from "../creditUtils";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const CREDIT_COST = 2;

export const BarcodeScannerView = ({ onBack }: { onBack: () => void }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const { credits, isLoading: creditsLoading } = useAnalyzerCredits();
  const queryClient = useQueryClient();

  const remaining = credits?.credits_remaining ?? 0;
  const insufficient = !creditsLoading && remaining < CREDIT_COST;

  const lookup = async () => {
    if (!code.trim()) { toast.error("Enter a barcode/QR code"); return; }
    if (loading) return;
    setLoading(true);
    try {
      const reservation = await reserveAnalyzerCredits(CREDIT_COST);
      const { data, error } = await supabase.functions.invoke("analyzer-barcode", { body: { code: code.trim() } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setProduct(data.product);
      await reservation.commit();
      queryClient.invalidateQueries({ queryKey: ["analyzer-credits"] });
    } catch (e: any) { toast.error(e.message || "Lookup failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Barcode Scanner View - How it works"} steps={[{ title: 'Open', desc: 'Access the Barcode Scanner View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Barcode Scanner View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 gap-1.5">
            <Coins className="w-3.5 h-3.5" />
            {creditsLoading ? "..." : `${remaining} credits`}
          </Badge>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2"><ScanBarcode className="w-7 h-7" /><h1 className="text-2xl sm:text-3xl font-black">Barcode / QR Scanner</h1></div>
            <p className="text-white/80 text-sm">Lookup products via Open Food Facts + AI fallback</p>
            <Badge className="mt-2 bg-white/20 text-white border-0">{CREDIT_COST} credits per lookup</Badge>
          </div>
        </motion.div>

        <Card className="p-6 border-cyan-500/20 bg-card/80 space-y-4">
          <Input
            placeholder="Enter barcode (EAN/UPC) or QR text — e.g. 3017620422003"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border-cyan-500/20"
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Tip: scan with your phone camera app, then paste here.</span>
            <span className={insufficient ? "text-red-400 font-semibold" : "text-muted-foreground"}>
              Cost: {CREDIT_COST} • You have: {creditsLoading ? "…" : remaining}
            </span>
          </div>
          {insufficient && (
            <p className="text-xs text-red-400">Not enough credits — top up to continue.</p>
          )}
          <Button onClick={lookup} disabled={loading || !code.trim() || insufficient} className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Looking up...</> : `Lookup Product (${CREDIT_COST} credits)`}
          </Button>
        </Card>

        {product && (
          <Card className="p-6 border-cyan-500/20 space-y-3">
            {product.image_url && <img src={product.image_url} alt={product.name} className="max-h-48 mx-auto rounded-lg" />}
            <h2 className="text-xl font-bold text-cyan-400">{product.name || "Result"}</h2>
            {product.brand && <p><b>Brand:</b> {product.brand}</p>}
            {product.categories && <p className="text-sm"><b>Categories:</b> {product.categories}</p>}
            {product.ingredients && <p className="text-sm"><b>Ingredients:</b> {product.ingredients}</p>}
            {product.allergens && <p className="text-sm text-red-400"><b>Allergens:</b> {product.allergens}</p>}
            <div className="flex gap-2 flex-wrap">
              {product.nutriscore && <Badge>Nutri-Score: {String(product.nutriscore).toUpperCase()}</Badge>}
              {product.ecoscore && <Badge variant="outline">Eco-Score: {String(product.ecoscore).toUpperCase()}</Badge>}
              {product.calories_per_100g != null && <Badge variant="secondary">{product.calories_per_100g} kcal / 100g</Badge>}
            </div>
            {product.ai_result && <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{product.ai_result}</div>}
            {product.message && <p className="text-muted-foreground text-sm">{product.message}</p>}
            <p className="text-[10px] text-muted-foreground">Source: {product.source}</p>
          </Card>
        )}
      </div>
    </div>
    </>
  );
};
