import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mic, MicOff, Loader2, Sparkles, ArrowLeft, Volume2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function PetAudioRecorder({ onBack }: { onBack: () => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [petType, setPetType] = useState("dog");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch {
      toast.error("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleAnalyze = async () => {
    if (!audioBlob) { toast.error("Please record audio first"); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }

      const { data, error } = await supabase.functions.invoke("pet-translator-ai", {
        body: {
          action: "audio_translate",
          pet_type: petType,
          recording_duration: recordingTime,
          description: `Live audio recording of a ${petType} for ${recordingTime} seconds. The user recorded their pet's sounds in real-time for translation.`,
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success("Audio analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <>
      <FloatingHowItWorks title="How Pet Audio Recorder works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      <Card className="max-w-3xl mx-auto bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border-purple-500/20">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-3">
            <Mic className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">🎙️ Live Audio Recording</CardTitle>
          <p className="text-muted-foreground">Record your pet's sounds for real-time AI translation</p>
          <Badge className="w-fit mx-auto bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Sparkles className="h-3 w-3 mr-1" /> 5 Credits
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={isRecording ? { scale: [1, 1.1, 1], boxShadow: ["0 0 0 0 rgba(239,68,68,0.4)", "0 0 0 20px rgba(239,68,68,0)", "0 0 0 0 rgba(239,68,68,0.4)"] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={`w-24 h-24 rounded-full flex items-center justify-center cursor-pointer ${isRecording ? "bg-red-500" : "bg-gradient-to-br from-purple-500 to-fuchsia-500"}`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <MicOff className="h-10 w-10 text-white" /> : <Mic className="h-10 w-10 text-white" />}
            </motion.div>
            <p className="text-sm font-medium">{isRecording ? `Recording... ${formatTime(recordingTime)}` : audioBlob ? `Recorded: ${formatTime(recordingTime)}` : "Tap to start recording"}</p>
          </div>

          {audioBlob && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Volume2 className="h-4 w-4 text-purple-400" />
              <span className="text-sm">Audio captured — {formatTime(recordingTime)}</span>
              <Button variant="ghost" size="sm" className="ml-auto text-xs" onClick={() => { setAudioBlob(null); setRecordingTime(0); }}>Clear</Button>
            </div>
          )}

          <select value={petType} onChange={e => setPetType(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="bird">Bird</option>
            <option value="other">Other</option>
          </select>

          <Button onClick={handleAnalyze} disabled={loading || !audioBlob} className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Translating...</> : "Translate Audio"}
          </Button>

          {result && (
            <Card className="bg-card/80 border-purple-500/20 p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
            </Card>
          )}
        </CardContent>
      </Card>
    </motion.div>
    </>
    );
}
