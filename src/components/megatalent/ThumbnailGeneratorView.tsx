import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ImagePlus, Loader2, Sparkles, Palette, MousePointerClick } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const ThumbnailGeneratorView = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generate = async () => {
    if (!title) { toast({ title: "Error", description: "Please enter a title", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("megatalent-ai", {
        body: { action: "thumbnail_generator", title, description, category: category || "general" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast({ title: "Thumbnails Generated! 🎨" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Thumbnail Generator View - How it works"} steps={[{ title: 'Open', desc: 'Access the Thumbnail Generator View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Thumbnail Generator View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
            <ImagePlus className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">AI Thumbnail Generator</h2>
          <p className="text-muted-foreground mt-2">Create eye-catching thumbnail concepts that boost engagement</p>
          <Badge variant="outline" className="mt-2 border-amber-500/30 text-amber-500">3 Credits per generation</Badge>
        </div>
      </motion.div>

      <Card className="bg-card/80 backdrop-blur-xl border-amber-500/20">
        <CardHeader><CardTitle className="text-lg">Your Submission Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Submission title..." />
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g., dance, singing)..." />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your content..." />
          <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-600" size="lg">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Thumbnails</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <div className="grid gap-4">
            {result.concepts?.map((c: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}>
                <Card className="bg-card/80 backdrop-blur-xl hover:border-amber-500/40 transition-all border-border/30">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{c.title}</h3>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        <MousePointerClick className="h-3 w-3 mr-1" /> {c.click_probability}% CTR
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1"><Palette className="h-3 w-3 text-amber-500" /> {c.color_scheme}</div>
                      <div>📝 {c.text_overlay}</div>
                      <div>🎬 {c.composition}</div>
                      <div>💡 {c.emotional_hook}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {result.viral_elements && (
            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-2">🔥 Viral Elements</p>
                <div className="flex flex-wrap gap-2">{result.viral_elements.map((v: string, i: number) => <Badge key={i} variant="outline" className="text-xs">{v}</Badge>)}</div>
              </CardContent>
            </Card>
          )}

          <Badge variant="outline" className="text-xs">Credits remaining: {result.credits_remaining}</Badge>
        </motion.div>
      )}
    </div>
    </>
  );
};
