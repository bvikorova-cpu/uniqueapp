import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, Sparkles, X, Loader2, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

type Turn = { role: "user" | "assistant"; content: string };

export function UniAssistant() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [caption, setCaption] = useState<{ role: "user" | "assistant"; text: string } | null>(null);
  const captionTimerRef = useRef<number | null>(null);

  const showCaption = (role: "user" | "assistant", text: string, autoHideMs?: number) => {
    if (captionTimerRef.current) window.clearTimeout(captionTimerRef.current);
    setCaption({ role, text });
    if (autoHideMs) {
      captionTimerRef.current = window.setTimeout(() => setCaption(null), autoHideMs);
    }
  };
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const supported = typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop?.(); } catch {}
      try { window.speechSynthesis?.cancel?.(); } catch {}
      try { audioRef.current?.pause(); } catch {}
    };
  }, []);

  const stopSpeaking = () => {
    try { window.speechSynthesis?.cancel?.(); } catch {}
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    } catch {}
    setSpeaking(false);
  };

  const speakBrowser = (text: string) => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.02;
      u.pitch = 1.05;
      u.onend = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    } catch {}
  };

  const speak = async (text: string) => {
    stopSpeaking();
    setSpeaking(true);
    try {
      const { data, error } = await supabase.functions.invoke("uni-tts", {
        body: { text, voice: "alloy" },
      });
      if (error) throw error;
      // invoke returns a Blob for non-JSON responses
      const blob = data instanceof Blob
        ? data
        : new Blob([data as ArrayBuffer], { type: "audio/mpeg" });
      if (!blob || blob.size === 0) throw new Error("empty_audio");
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setSpeaking(false); URL.revokeObjectURL(url); speakBrowser(text); };
      await audio.play();
    } catch {
      // Fallback to native Web Speech synthesis
      speakBrowser(text);
    }
  };

  const send = async (text: string) => {
    if (!text.trim()) return;
    setTurns((t) => [...t, { role: "user", content: text }]);
    showCaption("user", text);
    setThinking(true);
    try {
      const { data, error } = await supabase.functions.invoke("uni-assistant", {
        body: { transcript: text, currentRoute: location.pathname },
      });
      if (error) throw error;
      if (data?.error === "INSUFFICIENT_CREDITS") {
        toast({ title: "Not enough credits", description: "Uni costs 5 credits per command.", variant: "destructive" });
        const msg = "You need 5 credits to use me. Top up in Wallet.";
        setTurns((t) => [...t, { role: "assistant", content: msg }]);
        showCaption("assistant", msg, 6000);
        return;
      }
      if (data?.error) throw new Error(data.error);
      const reply = data?.reply ?? "Okay.";
      setTurns((t) => [...t, { role: "assistant", content: reply }]);
      showCaption("assistant", reply);
      speak(reply);
      if (data?.action?.type === "navigate" && data.action.path) {
        setTimeout(() => navigate(data.action.path), 400);
      }
    } catch (e: any) {
      toast({ title: "Uni error", description: e.message ?? "Try again", variant: "destructive" });
    } finally {
      setThinking(false);
      setTranscript("");
    }
  };

  const startListening = () => {
    if (!supported) {
      toast({ title: "Voice not supported", description: "Your browser has no speech recognition.", variant: "destructive" });
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = navigator.language || "en-US";
    rec.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      setTranscript(final || interim);
      if (final) send(final);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    setTranscript("");
    rec.start();
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop?.(); } catch {}
    setListening(false);
  };

  const fab = (
    <button
      aria-label="Open Uni voice assistant"
      onClick={() => setOpen(true)}
      className="fixed bottom-24 right-4 md:right-6 z-[9998] h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/40 flex items-center justify-center hover:scale-110 transition-transform"
    >
      <Sparkles className="h-6 w-6 text-white" />
      <span className="absolute -top-1 -right-1 bg-background text-[9px] font-black px-1.5 py-0.5 rounded-full border border-primary/40 text-primary">Uni</span>
    </button>
  );

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full md:max-w-md bg-card border-t md:border md:rounded-2xl border-primary/30 shadow-2xl p-5 space-y-4 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-black text-sm">Uni</p>
                  <p className="text-[10px] text-muted-foreground">5 credits per command</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 min-h-[120px]">
              {turns.length === 0 && (
                <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/50">
                  <p className="font-semibold mb-1">Try saying:</p>
                  <ul className="space-y-0.5">
                    <li>• "Open Megatalent"</li>
                    <li>• "Go to my wallet"</li>
                    <li>• "Motivate me today"</li>
                    <li>• "Show the mentor hub"</li>
                  </ul>
                </div>
              )}
              {turns.map((t, i) => (
                <div key={i} className={`text-sm p-2.5 rounded-lg ${t.role === "user" ? "bg-primary/10 ml-6" : "bg-muted mr-6"}`}>
                  {t.content}
                </div>
              ))}
              {transcript && listening && (
                <div className="text-sm p-2.5 rounded-lg bg-primary/5 border border-primary/20 italic ml-6">
                  {transcript}…
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 border-t border-border">
              {listening ? (
                <Button onClick={stopListening} variant="destructive" size="lg" className="rounded-full h-14 w-14 p-0">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Mic className="h-6 w-6" />
                  </motion.div>
                </Button>
              ) : thinking ? (
                <Button disabled size="lg" className="rounded-full h-14 w-14 p-0">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </Button>
              ) : speaking ? (
                <Button onClick={stopSpeaking} size="lg" className="rounded-full h-14 w-14 p-0" variant="secondary">
                  <Volume2 className="h-6 w-6" />
                </Button>
              ) : (
                <Button onClick={startListening} size="lg" className="rounded-full h-14 w-14 p-0 bg-gradient-to-br from-primary to-accent">
                  <Mic className="h-6 w-6" />
                </Button>
              )}
            </div>
            <p className="text-[10px] text-center text-muted-foreground">
              {listening ? "Listening…" : thinking ? "Uni is thinking…" : speaking ? "Uni is speaking…" : "Tap the mic and speak"}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return (
    <>
      {createPortal(fab, document.body)}
      {createPortal(modal, document.body)}
    </>
  );
}

export default UniAssistant;
