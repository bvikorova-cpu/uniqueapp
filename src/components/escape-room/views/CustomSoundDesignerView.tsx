import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Music, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function CustomSoundDesignerView({ onBack }: { onBack: () => void }) {
  const [roomTheme, setRoomTheme] = useState("");
  const [mood, setMood] = useState("tense");
  const [sceneDesc, setSceneDesc] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!roomTheme.trim()) { toast.error("Enter a room theme"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stock-content-ai", {
        body: { action: "escape-sound-design", roomTheme, mood, sceneDesc },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success("Sound design generated! (5 credits used)");
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Custom Sound Designer</h2>
            <p className="text-muted-foreground text-sm">AI-generated sound design blueprints for your rooms · 5 CR</p>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Sound Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Room Theme</label>
              <Input placeholder="Underground bunker, space station..." value={roomTheme} onChange={e => setRoomTheme(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Mood</label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tense">Tense & Suspenseful</SelectItem>
                  <SelectItem value="horror">Horror & Dread</SelectItem>
                  <SelectItem value="adventure">Adventure & Discovery</SelectItem>
                  <SelectItem value="mystery">Mystery & Intrigue</SelectItem>
                  <SelectItem value="scifi">Sci-Fi & Futuristic</SelectItem>
                  <SelectItem value="calm">Calm & Ethereal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Scene Description (optional)</label>
              <Textarea placeholder="Players enter a dark corridor with dripping water..." value={sceneDesc} onChange={e => setSceneDesc(e.target.value)} rows={4} />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-pink-600 to-rose-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate Sound Design
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sound Blueprint</CardTitle></CardHeader>
          <CardContent>
            {result ? (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">{result}</div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">Configure settings and generate your sound design blueprint</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
