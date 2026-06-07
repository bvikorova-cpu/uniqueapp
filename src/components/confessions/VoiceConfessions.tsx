import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mic, MicOff, Square, Play, Pause, Send, Clock, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { escapeWithLineBreaks } from "@/lib/sanitizeHtml";

interface VoiceEntry {
  id: string;
  text: string;
  audioUrl: string | null;
  duration: number;
  timestamp: string;
  aiTranscription: string | null;
}

export const VoiceConfessions = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [manualText, setManualText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [entries, setEntries] = useState<VoiceEntry[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
      toast({ title: "Recording started", description: "Speak your confession..." });
    } catch {
      toast({ title: "Microphone access denied", description: "Please allow microphone access to record voice confessions.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const submitVoiceConfession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }

    if (!audioBlob && !manualText.trim()) {
      toast({ title: "Record audio or type your confession", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      let storedAudioUrl: string | null = null;

      // Upload audio if available
      if (audioBlob) {
        const fileName = `voice-confessions/${user.id}/${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(fileName, audioBlob, { contentType: "audio/webm" });
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);
          storedAudioUrl = urlData.publicUrl;
        }
      }

      // Get AI transcription / analysis
      const confessionText = manualText.trim() || "Voice confession recorded";
      const { data: aiData } = await supabase.functions.invoke("create-reincarnation-plan", {
        body: {
          planName: "Voice Confession Analysis",
          goalDescription: `Analyze this anonymous confession and provide:
1. **Emotional Assessment**: What emotions are present
2. **Severity Level**: Low/Medium/High impact
3. **Spiritual Insight**: Brief spiritual perspective
4. **Path Forward**: One actionable step for growth

Confession: "${confessionText}"

Respond in markdown format, be compassionate and brief.`,
        },
      });

      const analysis = aiData?.plan?.next_life_goal ||
        aiData?.plan?.soul_missions?.map((m: any) => m.mission).join("\n\n") ||
        "Analysis processed.";

      const newEntry: VoiceEntry = {
        id: Date.now().toString(),
        text: confessionText,
        audioUrl: storedAudioUrl,
        duration: recordingTime,
        timestamp: new Date().toISOString(),
        aiTranscription: analysis,
      };

      setEntries(prev => [newEntry, ...prev]);

      // Also save to confessions table
      await supabase.from("confessions").insert({
        user_id: user.id,
        confession_text: confessionText,
        sin_category: "voice",
        is_anonymous: true,
      });

      setAudioBlob(null);
      setAudioUrl(null);
      setManualText("");
      setRecordingTime(0);
      toast({ title: "Voice Confession Submitted!", description: "Your confession has been analyzed." });
    } catch (error: any) {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="text-lg font-black mb-2">🎙️ Voice Confessions</h3>
        <p className="text-sm text-muted-foreground">
          Record your confession by voice or type it. Get instant AI emotional analysis and spiritual insights.
        </p>
      </Card>

      {/* Recording Section */}
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50 space-y-4">
        <div className="flex flex-col items-center gap-4">
          {/* Recording Button */}
          <motion.button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${
              isRecording
                ? "bg-red-500 shadow-red-500/40 animate-pulse"
                : "bg-gradient-to-br from-violet-500 to-purple-600 shadow-purple-500/30 hover:shadow-purple-500/50"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRecording ? (
              <Square className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </motion.button>

          {isRecording && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono font-bold text-red-500">{formatTime(recordingTime)}</span>
              <span className="text-xs text-muted-foreground">Recording...</span>
            </motion.div>
          )}

          {!isRecording && !audioUrl && (
            <p className="text-xs text-muted-foreground">Tap to start recording your confession</p>
          )}
        </div>

        {/* Audio Preview */}
        {audioUrl && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <Button size="icon" variant="ghost" onClick={playAudio} className="shrink-0">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="flex-1">
              <div className="h-8 bg-gradient-to-r from-violet-500/30 to-purple-500/30 rounded-lg flex items-center px-2">
                <div className="flex gap-0.5 items-end h-5">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="w-1 bg-violet-400 rounded-full" style={{ height: `${Math.random() * 100}%` }} />
                  ))}
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="shrink-0">
              <Clock className="w-3 h-3 mr-1" />{formatTime(recordingTime)}
            </Badge>
            <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
          </motion.div>
        )}

        {/* Text Input */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Or type your confession:</p>
          <Textarea
            placeholder="Type your confession here..."
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={submitVoiceConfession} disabled={submitting || (!audioBlob && !manualText.trim())} className="w-full" size="lg">
          {submitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
          ) : (
            <><Send className="mr-2 h-4 w-4" /> Submit & Analyze</>
          )}
        </Button>
      </Card>

      {/* Results */}
      {entries.map((entry, i) => (
        <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
            <div className="flex items-center gap-2 mb-3">
              {entry.audioUrl ? (
                <Volume2 className="w-4 h-4 text-violet-500" />
              ) : (
                <Mic className="w-4 h-4 text-violet-500" />
              )}
              <span className="text-xs font-bold text-muted-foreground">
                {entry.audioUrl ? `Voice Confession (${formatTime(entry.duration)})` : "Written Confession"}
              </span>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>

            {entry.audioUrl && (
              <div className="mb-3">
                <audio controls src={entry.audioUrl} className="w-full h-8" />
              </div>
            )}

            <p className="text-sm mb-3 italic text-muted-foreground">"{entry.text}"</p>

            {entry.aiTranscription && (
              <div className="border-t border-border/30 pt-3">
                <p className="text-xs font-bold text-primary mb-1">AI Analysis:</p>
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs">
                  <div dangerouslySetInnerHTML={{ __html: escapeWithLineBreaks(entry.aiTranscription) }} />
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      ))}

      {entries.length === 0 && (
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <MicOff className="h-12 w-12 mx-auto text-primary/30 mb-3" />
          <p className="text-muted-foreground mb-1">No voice confessions yet</p>
          <p className="text-xs text-muted-foreground">Record or type your first confession to receive AI analysis</p>
        </Card>
      )}
    </div>
  );
};
