import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, FlaskConical, Sparkles, Trophy, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const ABTesterView = ({ onBack }: { onBack: () => void }) => {
  const [product, setProduct] = useState("");
  const [scriptA, setScriptA] = useState("");
  const [scriptB, setScriptB] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!product.trim() || !scriptA.trim()) { toast.error("Enter product and at least Script A"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("video-ad-tools", {
        body: { action: "ab_tester", product, scriptA, scriptB, audience, platform },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setResult(data.result);
      toast.success("A/B analysis complete! (4 CR)");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A B Tester View - How it works"} steps={[{ title: 'Open', desc: 'Access the A B Tester View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A B Tester View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div><h2 className="text-2xl font-black">AI Ad A/B Tester</h2><p className="text-muted-foreground text-sm">Compare ad variants with AI predictions</p></div>
          <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-violet-500 text-white border-0"><Sparkles className="w-3 h-3 mr-1" />4 CR</Badge>
        </div>
      </motion.div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Test Setup</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Product *</Label><Input placeholder="e.g. Fitness App" value={product} onChange={e => setProduct(e.target.value)} /></div>
            <div><Label>Script A (Control) *</Label><Textarea placeholder="Paste your first ad script..." value={scriptA} onChange={e => setScriptA(e.target.value)} rows={4} /></div>
            <div><Label>Script B (Variant)</Label><Textarea placeholder="Paste second variant or leave empty for AI to generate" value={scriptB} onChange={e => setScriptB(e.target.value)} rows={4} /></div>
            <div><Label>Target Audience</Label><Input placeholder="e.g. Young adults 18-30" value={audience} onChange={e => setAudience(e.target.value)} /></div>
            <div><Label>Platform</Label><Input placeholder="e.g. YouTube" value={platform} onChange={e => setPlatform(e.target.value)} /></div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-violet-600">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Testing...</> : <><FlaskConical className="mr-2 h-4 w-4" />Run A/B Test (4 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>A/B Test Results</CardTitle></CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center py-12 text-muted-foreground"><FlaskConical className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>Compare ad variants with AI-powered predictions</p></div>
            ) : (
              <div className="space-y-5 max-h-[700px] overflow-y-auto pr-2">
                {result.winner && (
                  <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30">
                    <CardContent className="py-4 flex items-center gap-3">
                      <Trophy className="w-8 h-8 text-amber-500" />
                      <div><p className="font-bold text-lg">Winner: {result.winner}</p><p className="text-sm text-muted-foreground">{result.winnerReason}</p></div>
                    </CardContent>
                  </Card>
                )}
                {result.variants && result.variants.map((v: any, i: number) => (
                  <Card key={i} className={`bg-muted/30 ${v.isWinner ? 'ring-2 ring-amber-500/50' : ''}`}>
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold">{v.name || `Variant ${String.fromCharCode(65 + i)}`}</h4>
                        <Badge variant={v.isWinner ? "default" : "outline"}>{v.predictedScore}/100</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-background rounded-lg"><p className="text-xs text-muted-foreground">CTR</p><p className="font-bold text-sm">{v.predictedCTR}</p></div>
                        <div className="p-2 bg-background rounded-lg"><p className="text-xs text-muted-foreground">Engagement</p><p className="font-bold text-sm">{v.predictedEngagement}</p></div>
                        <div className="p-2 bg-background rounded-lg"><p className="text-xs text-muted-foreground">Conversion</p><p className="font-bold text-sm">{v.predictedConversion}</p></div>
                      </div>
                      {v.strengths && <div className="text-sm"><strong>Strengths:</strong> {v.strengths.join(', ')}</div>}
                      {v.weaknesses && <div className="text-sm"><strong>Weaknesses:</strong> {v.weaknesses.join(', ')}</div>}
                    </CardContent>
                  </Card>
                ))}
                {result.recommendations && (
                  <div><h4 className="font-bold mb-2 flex items-center gap-1"><ArrowRight className="w-4 h-4" />Recommendations</h4>
                    <ul className="space-y-1">{result.recommendations.map((r: string, i: number) => <li key={i} className="text-sm">💡 {r}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
