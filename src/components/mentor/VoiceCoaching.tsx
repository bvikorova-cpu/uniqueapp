import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2, Volume2, Sparkles, Pause, Play } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export function VoiceCoaching() {
  const [message, setMessage] = useState("");
  const [area, setArea] = useState("career");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const { toast } = useToast();

  const quickPrompts = [
    "I'm feeling unmotivated today",
    "How do I handle criticism at work?",
    "I want to build better habits",
    "Help me stay focused on my goals",
  ];

  const getCoaching = async (text?: string) => {
    const msg = text || message;
    if (!msg.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      const { data, error } = await supabase.functions.invoke("mentor-ai-tools", {
        body: { action: "voice-coaching", mentorArea: area, message: msg },
      });
      if (error) throw error;
      setResponse(data.reply);
      setMessage("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const speak = () => {
    if (!response) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(response);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <FloatingHowItWorks title="How Voice Coaching works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mic className="h-4 w-4 text-primary" /> Voice AI Coach
          <span className="text-[10px] text-muted-foreground font-normal ml-auto">4 CR / session</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={area} onValueChange={setArea}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="career">🎯 Career</SelectItem>
            <SelectItem value="fitness">💪 Fitness</SelectItem>
            <SelectItem value="mindset">🧠 Mindset</SelectItem>
            <SelectItem value="relationships">❤️ Relationships</SelectItem>
          </SelectContent>
        </Select>

        <Textarea
          placeholder="What's on your mind? Tell your coach..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[60px] resize-none text-sm"
        />

        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((p, i) => (
            <Button key={i} variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => { setMessage(p); getCoaching(p); }}>
              {p}
            </Button>
          ))}
        </div>

        <Button onClick={() => getCoaching()} disabled={loading || !message.trim()} className="w-full gap-1.5" size="sm">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          Get Voice Coaching — 4 Credits
        </Button>

        <AnimatePresence>
          {response && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-semibold flex items-center gap-1"><Volume2 className="h-3 w-3" /> Coach Response</p>
                  <Button variant="ghost" size="sm" onClick={speak} className="h-7 w-7 p-0">
                    {speaking ? <Pause className="h-3.5 w-3.5 text-primary" /> : <Play className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{response}</p>
              </div>

              {/* Visual audio wave animation when speaking */}
              {speaking && (
                <motion.div className="flex items-center justify-center gap-1 py-2">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-primary rounded-full"
                      animate={{ height: [8, 20 + Math.random() * 16, 8] }}
                      transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.05 }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
    </>
    );
}
