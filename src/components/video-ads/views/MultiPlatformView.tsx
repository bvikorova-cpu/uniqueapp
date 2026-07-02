import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Globe, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function MultiPlatformView({ onBack }: Props) {
  const [product, setProduct] = useState("");
  const [script, setScript] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!script.trim()) { toast.error("Enter your script"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("video-ad-tools", {
        body: { action: "multi_platform", product, script },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Adaptations ready! (${data.credits_used} credits)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Multi Platform View - How it works"} steps={[{ title: 'Open', desc: 'Access the Multi Platform View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Multi Platform View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg"><Globe className="w-6 h-6 text-white" /></div>
          <div><h2 className="text-2xl font-black">Multi-Platform Adapter</h2><p className="text-muted-foreground text-sm">Adapt your script for all major platforms</p></div>
          <Badge className="ml-auto bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0"><Sparkles className="w-3 h-3 mr-1" />3 Credits</Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Original Script</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-semibold mb-1.5 block">Product</label><Input placeholder="Product name" value={product} onChange={e => setProduct(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Your Script *</label><Textarea placeholder="Paste your video ad script here..." value={script} onChange={e => setScript(e.target.value)} rows={8} /></div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adapting...</> : <><Globe className="w-4 h-4 mr-2" />Adapt for All Platforms (3 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Adaptations" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>
            {result?.adaptations ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {result.adaptations.map((a: any, i: number) => (
                  <Card key={i} className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">{a.platform}</span>
                        <div className="flex gap-1"><Badge variant="outline">{a.duration}</Badge><Badge variant="outline">{a.aspectRatio}</Badge></div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{a.scriptAdaptation}</p>
                      <div className="text-xs space-y-1">
                        <p><strong>Key Changes:</strong> {a.keyChanges}</p>
                        <p><strong>Tips:</strong> {a.platformTips}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">Paste your script to adapt for all platforms</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
