import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ImageIcon, Sparkles, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const ThumbnailGeneratorView = ({ onBack }: { onBack: () => void }) => {
  const [product, setProduct] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [audience, setAudience] = useState("");
  const [style, setStyle] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!product.trim()) { toast.error("Enter a product name"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("video-ad-tools", {
        body: { action: "thumbnail_generator", product, platform, audience, style },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setResult(data.result);
      toast.success("Thumbnails generated! (2 CR)");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Thumbnail Generator View - How it works"} steps={[{ title: 'Open', desc: 'Access the Thumbnail Generator View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Thumbnail Generator View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div><h2 className="text-2xl font-black">AI Video Thumbnail Generator</h2><p className="text-muted-foreground text-sm">Create click-worthy thumbnails for your ads</p></div>
          <Badge className="ml-auto bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0"><Sparkles className="w-3 h-3 mr-1" />2 CR</Badge>
        </div>
      </motion.div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" />Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Product / Ad Topic *</Label><Input placeholder="e.g. Premium Fitness App" value={product} onChange={e => setProduct(e.target.value)} /></div>
            <div><Label>Target Audience</Label><Input placeholder="e.g. Young professionals" value={audience} onChange={e => setAudience(e.target.value)} /></div>
            <div><Label>Platform</Label><Select value={platform} onValueChange={setPlatform}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="youtube">YouTube</SelectItem><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="tiktok">TikTok</SelectItem><SelectItem value="facebook">Facebook</SelectItem></SelectContent></Select></div>
            <div><Label>Style</Label><Select value={style} onValueChange={setStyle}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="professional">Professional</SelectItem><SelectItem value="bold">Bold & Vibrant</SelectItem><SelectItem value="minimalist">Minimalist</SelectItem><SelectItem value="cinematic">Cinematic</SelectItem></SelectContent></Select></div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-rose-600">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><ImageIcon className="mr-2 h-4 w-4" />Generate (2 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Thumbnail Concepts</CardTitle></CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center py-12 text-muted-foreground"><ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>Generate thumbnail concepts for your video ads</p></div>
            ) : (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                {result.thumbnails?.map((t: any, i: number) => (
                  <Card key={i} className="bg-muted/30">
                    <CardContent className="pt-4 space-y-2">
                      <h4 className="font-bold text-lg">Concept {i + 1}: {t.title}</h4>
                      <p className="text-sm"><strong>Layout:</strong> {t.layout}</p>
                      <p className="text-sm"><strong>Image:</strong> {t.imageDescription}</p>
                      <p className="text-sm"><strong>Text Overlay:</strong> {t.textOverlay}</p>
                      <p className="text-sm"><strong>Emotional Appeal:</strong> {t.emotionalAppeal}</p>
                      <div className="flex gap-2 flex-wrap">
                        {t.dominantColors?.map((c: string, j: number) => (
                          <Badge key={j} variant="outline">{c}</Badge>
                        ))}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Clickbait: {t.clickbaitLevel}/10</span>
                        <span>A11y: {t.a11yScore}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {result.bestPractices && <div className="mt-4 p-4 bg-primary/5 rounded-xl"><h4 className="font-bold mb-2">Best Practices</h4><p className="text-sm text-muted-foreground">{result.bestPractices}</p></div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
