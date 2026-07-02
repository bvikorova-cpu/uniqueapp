import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Mic, Loader2, Play, Pause, Volume2, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const VoiceMessages = () => {
  const { toast } = useToast();
  const [companions, setCompanions] = useState<any[]>([]);
  const [selectedCompanion, setSelectedCompanion] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadCompanions();
    loadHistory();
  }, []);

  const loadCompanions = async () => {
    const { data } = await supabase.from("ai_characters").select("id, name, personality_type");
    setCompanions(data || []);
  };

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("character_messages")
      .select("*, character_conversations(character_id, ai_characters(name))")
      .eq("role", "assistant")
      .not("audio_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(10);
    setHistory(data || []);
  };

  const generateVoice = async () => {
    if (!selectedCompanion || !message.trim()) {
      toast({ title: "Missing fields", description: "Select a companion and type a message", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("companion-ai", {
        body: { action: "voice-message", characterId: selectedCompanion, message: message.trim() },
      });
      if (error) throw error;

      if (data?.response_text) {
        toast({ title: "Voice Generated", description: `${data.companion_name} responded!` });
        setAudioUrl(data.audio_url || null);
        loadHistory();
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to generate voice", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (url: string) => {
    if (audio) { audio.pause(); }
    const newAudio = new Audio(url);
    newAudio.play();
    setAudio(newAudio);
    setPlaying(true);
    newAudio.onended = () => setPlaying(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Voice Messages"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-4">
            <Mic className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Voice Messages
          </h1>
          <p className="text-muted-foreground mt-2">Send messages and hear your companions respond with AI-generated voice</p>
          <Badge variant="outline" className="mt-2">2 Credits per voice message</Badge>
        </div>
      </motion.div>

      <Card className="bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg">Generate Voice Response</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Choose Companion</label>
            <Select value={selectedCompanion} onValueChange={setSelectedCompanion}>
              <SelectTrigger>
                <SelectValue placeholder="Select a companion..." />
              </SelectTrigger>
              <SelectContent>
                {companions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} — {c.personality_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message to the companion..."
            rows={3}
          />

          <Button onClick={generateVoice} disabled={loading} className="w-full" size="lg">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Voice...</>
              : <><Sparkles className="h-4 w-4 mr-2" /> Send & Get Voice Reply</>}
          </Button>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-primary" /> Recent Voice Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.map((msg) => (
                <div key={msg.id} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {msg.character_conversations?.ai_characters?.name || 'Companion'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{msg.content.slice(0, 60)}...</p>
                  </div>
                  {msg.audio_url && (
                    <Button size="sm" variant="ghost" onClick={() => playAudio(msg.audio_url)}>
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
