import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Layout, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function StoryboardView({ onBack }: Props) {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState("30");
  const [platform, setPlatform] = useState("youtube");
  const [style, setStyle] = useState("cinematic");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!product.trim() || !message.trim()) { toast.error("Fill in required fields"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("video-ad-tools", {
        body: { action: "storyboard", product, audience, message, duration, platform, style },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Storyboard created! (${data.credits_used} credits)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <FloatingHowItWorks title={"Storyboard View - How it works"} steps={[{ title: 'Open', desc: 'Access the Storyboard View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Storyboard View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Storyboard Creator</h2>
            <p className="text-muted-foreground text-sm">Visual storyboard with frame-by-frame breakdown</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-orange-500 to-red-500 text-white border-0"><Sparkles className="w-3 h-3 mr-1" />3 Credits</Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Storyboard Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-semibold mb-1.5 block">Product/Service *</label><Input placeholder="e.g. Mobile banking app" value={product} onChange={e => setProduct(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Target Audience</label><Input placeholder="e.g. Millennials" value={audience} onChange={e => setAudience(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Key Message *</label><Textarea placeholder="Main message..." value={message} onChange={e => setMessage(e.target.value)} rows={3} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-sm font-semibold mb-1.5 block">Duration</label>
                <Select value={duration} onValueChange={setDuration}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15s</SelectItem><SelectItem value="30">30s</SelectItem><SelectItem value="60">60s</SelectItem></SelectContent></Select>
              </div>
              <div><label className="text-sm font-semibold mb-1.5 block">Platform</label>
                <Select value={platform} onValueChange={setPlatform}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="youtube">YouTube</SelectItem><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="tiktok">TikTok</SelectItem></SelectContent></Select>
              </div>
              <div><label className="text-sm font-semibold mb-1.5 block">Style</label>
                <Select value={style} onValueChange={setStyle}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cinematic">Cinematic</SelectItem><SelectItem value="minimal">Minimal</SelectItem><SelectItem value="animated">Animated</SelectItem><SelectItem value="documentary">Documentary</SelectItem></SelectContent></Select>
              </div>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : <><Layout className="w-4 h-4 mr-2" />Create Storyboard (3 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Storyboard" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={copyAll}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                <h3 className="font-bold text-lg">{result.title}</h3>
                <div className="flex gap-2 flex-wrap">
                  {result.colorPalette?.map((c: string, i: number) => (
                    <Badge key={i} variant="outline">{c}</Badge>
                  ))}
                </div>
                {result.frames?.map((f: any, i: number) => (
                  <Card key={i} className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">Frame {f.frameNumber}</span>
                        <Badge variant="outline">{f.duration}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong className="text-foreground">Camera:</strong> {f.cameraAngle} — {f.shotType}</p>
                        <p><strong className="text-foreground">Visual:</strong> {f.description}</p>
                        {f.textOverlay && <p><strong className="text-foreground">Text:</strong> {f.textOverlay}</p>}
                        <p><strong className="text-foreground">Transition:</strong> {f.transition}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">Configure settings to generate your storyboard</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
