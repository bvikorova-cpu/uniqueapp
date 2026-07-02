import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Music, Loader2, Play, Headphones } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const MoodPlaylistView = () => {
  const [mood, setMood] = useState("");
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generate = async () => {
    if (!mood.trim()) { toast.error("Please describe your mood"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-ai", {
        body: { action: "mood_playlist", mood, preferences },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Playlist created! (3 credits used)");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Mood Playlist View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center">
        <Music className="h-10 w-10 text-pink-400 mx-auto mb-2" />
        <h2 className="text-2xl font-black">AI Mood Playlist</h2>
        <p className="text-muted-foreground text-sm">Music recommendations based on your current emotional state</p>
        <Badge variant="secondary" className="mt-2">3 Credits</Badge>
      </div>

      {!result ? (
        <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">How are you feeling right now?</label>
              <Input value={mood} onChange={(e) => setMood(e.target.value)} placeholder="e.g., anxious but hopeful, nostalgic, energetic..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Music preferences (optional)</label>
              <Input value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="e.g., indie, jazz, pop, lo-fi..." />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-pink-600 to-purple-600">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Headphones className="h-4 w-4 mr-2" />}
              Generate Playlist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Playlist Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-to-br from-pink-500/15 to-purple-500/15 border-purple-500/20">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-black">🎵 {result.playlist_name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{result.playlist_description}</p>
                {result.mood_transition && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                    <Badge variant="outline">{result.mood_transition.current_mood}</Badge>
                    <span>→</span>
                    <Badge className="bg-purple-500/20 text-purple-300">{result.mood_transition.target_mood}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Songs */}
          <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Play className="h-5 w-5 text-pink-400" /> Tracks</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {result.songs?.map((song: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50 hover:border-purple-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center text-sm font-bold">{i + 1}</div>
                    <div>
                      <p className="font-medium text-sm">{song.title}</p>
                      <p className="text-xs text-muted-foreground">{song.artist} • {song.genre}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <div key={j} className={`w-1 h-3 rounded-full ${j < song.energy_level ? "bg-purple-400" : "bg-muted"}`} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          {result.listening_order_tip && (
            <Card className="bg-card/80 backdrop-blur-xl border-purple-500/20">
              <CardContent className="p-4">
                <p className="text-sm"><strong>🎧 Listening tip:</strong> {result.listening_order_tip}</p>
                {result.bonus_activity && <p className="text-sm mt-2"><strong>✨ Pair with:</strong> {result.bonus_activity}</p>}
              </CardContent>
            </Card>
          )}

          <Button onClick={() => setResult(null)} variant="outline" className="w-full">Create Another Playlist</Button>
        </div>
      )}
    </div>
  );
};
