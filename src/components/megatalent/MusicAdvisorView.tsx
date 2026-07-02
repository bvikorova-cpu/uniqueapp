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
import { Music, Loader2, Sparkles, Volume2, Disc3, ListMusic } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const MusicAdvisorView = () => {
  const { toast } = useToast();
  const [category, setCategory] = useState("");
  const [contentType, setContentType] = useState("");
  const [description, setDescription] = useState("");
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    if (!category || !contentType) { toast({ title: "Error", description: "Please fill category and content type", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("megatalent-ai", {
        body: { action: "music_advisor", category, contentType, description, mood },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast({ title: "Music Suggestions Ready! 🎵" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Music Advisor View - How it works"} steps={[{ title: 'Open', desc: 'Access the Music Advisor View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Music Advisor View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Music className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">AI Music & Sound Advisor</h2>
          <p className="text-muted-foreground mt-2">Get perfect music and sound recommendations for your video content</p>
          <Badge variant="outline" className="mt-2 border-violet-500/30 text-violet-500">3 Credits per analysis</Badge>
        </div>
      </motion.div>

      <Card className="bg-card/80 backdrop-blur-xl border-violet-500/20">
        <CardHeader><CardTitle className="text-lg">Describe Your Video</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Talent category..." /></SelectTrigger>
            <SelectContent>
              {["Dance", "Singing", "Comedy", "Sports", "Parkour", "Magic", "Cooking", "Art", "Photography", "Tutorial", "Other"].map(c => (
                <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger><SelectValue placeholder="Content type..." /></SelectTrigger>
            <SelectContent>
              {["Short clip (15-30s)", "Medium video (1-3 min)", "Long performance (3+ min)", "Montage / Highlights", "Time-lapse", "Slow motion"].map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={mood} onValueChange={setMood}>
            <SelectTrigger><SelectValue placeholder="Desired mood..." /></SelectTrigger>
            <SelectContent>
              {["Energetic / Hype", "Calm / Peaceful", "Epic / Cinematic", "Fun / Playful", "Emotional / Moving", "Dark / Intense", "Chill / Lo-fi"].map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your video content, pacing, key moments..." className="min-h-[80px]" />
          <Button onClick={analyze} disabled={loading} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700" size="lg">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Finding music...</> : <><Volume2 className="h-4 w-4 mr-2" /> Get Music Suggestions</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {result.recommendations?.map((rec: any, i: number) => (
            <Card key={i} className="bg-card/80 backdrop-blur-xl border-violet-500/20">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                    <Disc3 className="h-5 w-5 text-violet-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm">{rec.song_title}</h4>
                      <Badge variant="outline" className="text-[10px]">{rec.genre}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">by {rec.artist}</p>
                    <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-[10px]">BPM: {rec.bpm}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{rec.mood}</Badge>
                      {rec.license && <Badge variant="secondary" className="text-[10px]">{rec.license}</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {result.sound_effects && (
            <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ListMusic className="h-4 w-4 text-purple-500" /> Sound Effects Tips</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.sound_effects.map((s: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm"><Sparkles className="h-3.5 w-3.5 text-purple-500 mt-0.5 shrink-0" />{s}</div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.editing_tips && (
            <Card className="bg-violet-500/10 border-violet-500/20">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-1">Audio Editing Tips</p>
                <p className="text-sm text-muted-foreground">{result.editing_tips}</p>
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