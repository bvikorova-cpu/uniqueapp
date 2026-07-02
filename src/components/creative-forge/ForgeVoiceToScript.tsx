import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, X, Loader2, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreativeAITools, VOICE_TO_SCRIPT_COST } from "@/hooks/useCreativeAITools";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const CATEGORIES = [
  { id: "song_lyrics", label: "Song Lyrics" },
  { id: "screenplay", label: "Screenplay" },
  { id: "theater_play", label: "Theater Play" },
  { id: "novel_chapter", label: "Novel Chapter" },
  { id: "poetry", label: "Poetry" },
  { id: "standup", label: "Stand-up" },
  { id: "podcast_script", label: "Podcast Script" },
  { id: "ad_copy", label: "Ad Copy" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  defaultCategory?: string;
  onApply: (text: string) => void;
}

export const ForgeVoiceToScript = ({ open, onClose, defaultCategory = "song_lyrics", onApply }: Props) => {
  const [transcript, setTranscript] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [result, setResult] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { voiceToScript } = useCreativeAITools();

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported. Please type your idea instead.");
      return;
    }
    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";
    recog.onresult = (event: any) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + " ";
      }
      if (final) setTranscript(prev => prev + final);
    };
    recog.onerror = () => { setRecording(false); toast.error("Recording error"); };
    recog.onend = () => setRecording(false);
    recog.start();
    recognitionRef.current = recog;
    setRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const run = async () => {
    if (!transcript.trim()) return;
    const res = await voiceToScript.mutateAsync({ transcript, category });
    setResult(res.script);
  };

  if (!open) return null;

  return (
    <>
      <FloatingHowItWorks title={"Forge Voice To Script - How it works"} steps={[{ title: 'Open', desc: 'Access the Forge Voice To Script section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Forge Voice To Script.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-3xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-amber-700/40 bg-[hsl(30,15%,8%)]/95 backdrop-blur-2xl shadow-[0_0_60px_rgba(251,191,36,0.2)]">
            <CardHeader className="pb-3 border-b border-amber-700/30 flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-amber-100" style={{ fontFamily: "Georgia, serif" }}>
                <Mic className="h-5 w-5 text-amber-400" />
                Voice-to-Script
                <Badge variant="outline" className="border-amber-600/40 text-amber-300 text-[10px] ml-2">{VOICE_TO_SCRIPT_COST} cr</Badge>
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-amber-200 hover:text-amber-100 hover:bg-amber-900/20">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-amber-200/80 mb-1 block">Output format</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-black/30 border-amber-700/40 text-amber-50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={recording ? stopRecording : startRecording}
                  variant={recording ? "destructive" : "outline"}
                  className={recording ? "" : "border-amber-700/40 text-amber-200 hover:bg-amber-900/20 hover:text-amber-100"}
                >
                  {recording ? <><MicOff className="h-4 w-4 mr-2" /> Stop</> : <><Mic className="h-4 w-4 mr-2" /> Record</>}
                </Button>
              </div>

              <div>
                <label className="text-xs text-amber-200/80 mb-1 block">Brainstorm transcript {recording && <span className="text-rose-400 animate-pulse">● recording</span>}</label>
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={5}
                  placeholder="Speak or type your raw idea, even messy thoughts…"
                  className="bg-black/30 border-amber-700/40 text-amber-50 placeholder:text-amber-200/40"
                />
              </div>

              <Button
                onClick={run}
                disabled={voiceToScript.isPending || !transcript.trim()}
                className="w-full bg-gradient-to-r from-amber-700 to-rose-700 hover:from-amber-600 hover:to-rose-600 text-white"
              >
                {voiceToScript.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                Generate Polished Draft
              </Button>

              {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="text-xs text-amber-200/80 mb-1 block">Polished {CATEGORIES.find(c => c.id === category)?.label}</label>
                  <ScrollArea className="h-48 border border-amber-700/30 rounded-lg p-3 bg-black/40">
                    <pre className="whitespace-pre-wrap font-serif text-sm text-amber-50 leading-relaxed">{result}</pre>
                  </ScrollArea>
                  <Button
                    onClick={() => { onApply(result); onClose(); }}
                    className="mt-2 w-full bg-amber-700 hover:bg-amber-600 text-white"
                  >
                    Use This Draft
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    </>
  );
};
