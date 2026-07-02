import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Volume2, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export function AIRoomNarratorView({ onBack }: { onBack: () => void }) {
  const [roomTheme, setRoomTheme] = useState("");
  const [scene, setScene] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("dramatic");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!roomTheme.trim()) { toast.error("Enter a room theme"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stock-content-ai", {
        body: { action: "escape-narrator-gen", roomTheme, scene, voiceStyle },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success("Narration generated! (4 credits used)");
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Room Narrator View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Room Narrator View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Room Narrator View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Volume2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Room Narrator</h2>
            <p className="text-muted-foreground text-sm">Generate immersive narration scripts for your rooms · 4 CR</p>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Narration Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Room Theme</label>
              <Input placeholder="Abandoned spaceship, Victorian manor..." value={roomTheme} onChange={e => setRoomTheme(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Current Scene / Moment</label>
              <Textarea placeholder="Players just opened the hidden vault..." value={scene} onChange={e => setScene(e.target.value)} rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Voice Style</label>
              <Select value={voiceStyle} onValueChange={setVoiceStyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dramatic">Dramatic & Cinematic</SelectItem>
                  <SelectItem value="creepy">Creepy Whisper</SelectItem>
                  <SelectItem value="mysterious">Mysterious Guide</SelectItem>
                  <SelectItem value="urgent">Urgent & Tense</SelectItem>
                  <SelectItem value="calm">Calm Storyteller</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-purple-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate Narration
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Generated Script</CardTitle></CardHeader>
          <CardContent>
            {result ? (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">{result}</div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">Configure settings and generate your narration script</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
