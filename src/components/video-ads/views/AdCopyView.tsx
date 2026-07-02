import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PenTool, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function AdCopyView({ onBack }: Props) {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [message, setMessage] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [tone, setTone] = useState("professional");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!product.trim()) { toast.error("Enter product name"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("video-ad-tools", {
        body: { action: "ad_copy", product, audience, message, platform, tone },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Ad copy optimized! (${data.credits_used} credits)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Ad Copy View - How it works"} steps={[{ title: 'Open', desc: 'Access the Ad Copy View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Ad Copy View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg"><PenTool className="w-6 h-6 text-white" /></div>
          <div><h2 className="text-2xl font-black">AI Ad Copy Optimizer</h2><p className="text-muted-foreground text-sm">Headlines, CTAs, hashtags & emotional hooks</p></div>
          <Badge className="ml-auto bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0"><Sparkles className="w-3 h-3 mr-1" />2 Credits</Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Copy Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-semibold mb-1.5 block">Product *</label><Input placeholder="e.g. SaaS platform" value={product} onChange={e => setProduct(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Target Audience</label><Input placeholder="e.g. Small business owners" value={audience} onChange={e => setAudience(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Current Message</label><Textarea placeholder="Your current ad message..." value={message} onChange={e => setMessage(e.target.value)} rows={3} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-sm font-semibold mb-1.5 block">Platform</label>
                <Select value={platform} onValueChange={setPlatform}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="youtube">YouTube</SelectItem><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="tiktok">TikTok</SelectItem><SelectItem value="facebook">Facebook</SelectItem></SelectContent></Select>
              </div>
              <div><label className="text-sm font-semibold mb-1.5 block">Tone</label>
                <Select value={tone} onValueChange={setTone}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="professional">Professional</SelectItem><SelectItem value="casual">Casual</SelectItem><SelectItem value="energetic">Energetic</SelectItem><SelectItem value="humorous">Humorous</SelectItem></SelectContent></Select>
              </div>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Optimizing...</> : <><PenTool className="w-4 h-4 mr-2" />Optimize Copy (2 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Optimized Copy" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                <div><h3 className="font-bold text-lg">{result.headline}</h3><p className="text-muted-foreground">{result.subheadline}</p></div>
                <div><h4 className="font-semibold mb-2">📝 Body Variants</h4>{result.bodyVariants?.map((v: string, i: number) => (<div key={i} className="p-3 bg-muted/30 rounded-lg mb-2 text-sm">{v}</div>))}</div>
                <div><h4 className="font-semibold mb-2">🎯 CTA Variants</h4><div className="flex flex-wrap gap-2">{result.ctaVariants?.map((c: string, i: number) => (<Badge key={i} variant="secondary">{c}</Badge>))}</div></div>
                <div><h4 className="font-semibold mb-2">#️⃣ Hashtags</h4><div className="flex flex-wrap gap-1">{result.hashtagSuggestions?.map((h: string, i: number) => (<Badge key={i} variant="outline" className="text-xs">{h}</Badge>))}</div></div>
                <div><h4 className="font-semibold mb-2">💡 Emotional Hooks</h4><ul className="space-y-1">{result.emotionalHooks?.map((h: string, i: number) => (<li key={i} className="text-sm text-muted-foreground">• {h}</li>))}</ul></div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">Configure settings to optimize your ad copy</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
