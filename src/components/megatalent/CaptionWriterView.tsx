import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { PenTool, Loader2, Copy, Hash, MessageSquare, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const CaptionWriterView = () => {
  const { toast } = useToast();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generate = async () => {
    if (!category || !title) { toast({ title: "Error", description: "Please fill category and title", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("megatalent-ai", {
        body: { action: "caption_writer", category, title, description, tone },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast({ title: "Captions Generated! ✍️" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const copyText = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast({ title: "Copied!" }); } catch { toast({ title: "Copy failed", variant: "destructive" }); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Caption Writer View - How it works"} steps={[{ title: 'Open', desc: 'Access the Caption Writer View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Caption Writer View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
            <PenTool className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">AI Caption Writer</h2>
          <p className="text-muted-foreground mt-2">Generate engaging captions, hashtags, and descriptions for your posts</p>
          <Badge variant="outline" className="mt-2 border-emerald-500/30 text-emerald-500">3 Credits per generation</Badge>
        </div>
      </motion.div>

      <Card className="bg-card/80 backdrop-blur-xl border-emerald-500/20">
        <CardHeader><CardTitle className="text-lg">Content Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Talent category..." /></SelectTrigger>
            <SelectContent>
              {["Drawing", "Singing", "Dance", "Photography", "Cooking", "Comedy", "Sports", "Music", "Digital Art", "Magic", "Other"].map(c => (
                <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Submission title..." />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of your content..." className="min-h-[80px]" />
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger><SelectValue placeholder="Tone / style..." /></SelectTrigger>
            <SelectContent>
              {["Professional", "Casual & Fun", "Inspirational", "Mysterious", "Bold & Confident", "Humble", "Humorous"].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" size="lg">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Writing...</> : <><PenTool className="h-4 w-4 mr-2" /> Generate Captions</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {result.captions?.map((cap: any, i: number) => (
            <Card key={i} className="bg-card/80 backdrop-blur-xl border-emerald-500/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30">{cap.style}</Badge>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => copyText(cap.caption)}>
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                </div>
                <p className="text-sm mb-3">{cap.caption}</p>
                <div className="flex flex-wrap gap-1">
                  {cap.hashtags?.map((tag: string, j: number) => (
                    <Badge key={j} variant="secondary" className="text-[10px] cursor-pointer" onClick={() => copyText(tag)}>
                      <Hash className="h-2.5 w-2.5 mr-0.5" />{tag.replace('#', '')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {result.call_to_action && (
            <Card className="bg-emerald-500/10 border-emerald-500/20">
              <CardContent className="p-4 flex items-start gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Recommended Call-to-Action</p>
                  <p className="text-sm text-muted-foreground">{result.call_to_action}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {result.engagement_tips && (
            <Card className="bg-card/80 backdrop-blur-xl border-teal-500/20">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-teal-500" /> Engagement Tips</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.engagement_tips.map((t: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm"><span className="text-teal-500">→</span>{t}</div>
                ))}
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