import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, Heart, BookOpen, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const MemoryScrapbookView = () => {
  const [memory, setMemory] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const create = async () => {
    if (!memory.trim()) { toast.error("Please share a memory"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-ai", {
        body: { action: "memory_scrapbook", memory },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Scrapbook entry created! (3 credits used)");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Memory Scrapbook View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center">
        <Camera className="h-10 w-10 text-rose-400 mx-auto mb-2" />
        <h2 className="text-2xl font-black">AI Memory Scrapbook</h2>
        <p className="text-muted-foreground text-sm">Turn your cherished memories into beautiful digital keepsakes</p>
        <Badge variant="secondary" className="mt-2">3 Credits</Badge>
      </div>

      {!result ? (
        <Card className="bg-card/80 backdrop-blur-xl border-rose-500/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Share a memory you'd like to preserve</label>
              <Textarea value={memory} onChange={(e) => setMemory(e.target.value)} rows={5}
                placeholder="That time we went to the beach at sunset and..." className="resize-none" />
            </div>
            <Button onClick={create} disabled={loading} className="w-full bg-gradient-to-r from-rose-600 to-pink-600">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
              Create Scrapbook Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Entry Header */}
          {result.scrapbook_entry && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-gradient-to-br from-rose-500/15 to-pink-500/15 border-rose-500/20">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-black">{result.scrapbook_entry.title}</h3>
                  <p className="text-sm text-muted-foreground italic mt-1">&ldquo;{result.scrapbook_entry.tagline}&rdquo;</p>
                  {result.scrapbook_entry.date_label && (
                    <Badge variant="outline" className="mt-2 text-xs">{result.scrapbook_entry.date_label}</Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Story */}
          {result.story && (
            <Card className="bg-card/80 backdrop-blur-xl border-rose-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-5 w-5 text-rose-400" /> The Story</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{result.story}</p>
              </CardContent>
            </Card>
          )}

          {/* Emotions */}
          {result.emotions_captured && (
            <Card className="bg-card/80 backdrop-blur-xl border-rose-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Heart className="h-5 w-5 text-pink-400" /> Emotions Captured</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {result.emotions_captured.map((e: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                      className="p-3 rounded-xl text-center border border-border/50" style={{ borderColor: `${e.color}30` }}>
                      <span className="text-2xl">{e.emoji}</span>
                      <p className="font-medium text-sm mt-1">{e.emotion}</p>
                      <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${e.intensity * 10}%`, backgroundColor: e.color }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {result.memory_tags && (
            <div className="flex flex-wrap gap-2 justify-center">
              {result.memory_tags.map((tag: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">#{tag}</Badge>
              ))}
            </div>
          )}

          {/* Reflection */}
          {result.reflection && (
            <Card className="bg-card/80 backdrop-blur-xl border-rose-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-400" /> Reflection</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm"><strong>What it meant:</strong> {result.reflection.what_it_meant}</p>
                <p className="text-sm"><strong>Lesson learned:</strong> {result.reflection.lesson_learned}</p>
                <p className="text-sm"><strong>Gratitude:</strong> {result.reflection.gratitude}</p>
              </CardContent>
            </Card>
          )}

          {/* Rating */}
          {result.memory_rating && (
            <Card className="bg-card/80 backdrop-blur-xl border-rose-500/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-black">{result.memory_rating.nostalgia_level}/10</div>
                    <p className="text-xs text-muted-foreground">Nostalgia</p>
                  </div>
                  <div>
                    <div className="text-2xl font-black">{result.memory_rating.happiness_level}/10</div>
                    <p className="text-xs text-muted-foreground">Happiness</p>
                  </div>
                  <div>
                    <div className="text-2xl font-black">{result.memory_rating.significance}/10</div>
                    <p className="text-xs text-muted-foreground">Significance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Companion Note */}
          {result.companion_note && (
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-sm italic">💜 {result.companion_note}</p>
              </CardContent>
            </Card>
          )}

          {/* Activities */}
          {result.suggested_activities && (
            <Card className="bg-card/80 backdrop-blur-xl border-rose-500/20">
              <CardContent className="p-4">
                <p className="font-bold text-sm mb-2">✨ Relive the moment</p>
                <div className="flex flex-wrap gap-2">
                  {result.suggested_activities.map((a: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button onClick={() => setResult(null)} variant="outline" className="w-full">Create Another Entry</Button>
        </div>
      )}
    </div>
  );
};
