import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, Sparkles, X, Loader2, Volume2, Ear, EarOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Turn = { role: "user" | "assistant"; content: string };

interface UniAssistantProps {
  /** When true, the floating trigger is rendered inline (no fixed positioning)
   *  so it can be placed inside a shared dock such as FloatingAssistantDock. */
  docked?: boolean;
}

export function UniAssistant({ docked = false }: UniAssistantProps) {
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
  const wakeRef = useRef<any>(null);
  const wakeActiveRef = useRef(false);
  const [wakeEnabled, setWakeEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("uni-wake-word") === "1";
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const supported = typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop?.(); } catch {}
      try { wakeRef.current?.stop?.(); } catch {}
      wakeActiveRef.current = false;
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
      const live = final || interim;
      setTranscript(live);
      if (live) showCaption("user", live);
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

  const stopWakeWord = () => {
    wakeActiveRef.current = false;
    try { wakeRef.current?.stop?.(); } catch {}
    wakeRef.current = null;
  };

  const startWakeWord = () => {
    if (!supported || wakeRef.current) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = navigator.language || "en-US";
    wakeActiveRef.current = true;
    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = (e.results[i][0]?.transcript || "").toLowerCase().trim();
        if (!text) continue;
        // Match "hey uni", "hej uni", "hi uni", "ok uni"
        if (/\b(hey|hej|hi|ok|okay)\s+u+ni+\b/.test(text) || /\buni\b.*(wake|start|listen)/.test(text)) {
          stopWakeWord();
          setOpen(true);
          // small delay so wake recognizer fully releases mic
          setTimeout(() => { startListening(); }, 250);
          return;
        }
      }
    };
    rec.onerror = (ev: any) => {
      // On permission denial, disable persistently
      if (ev?.error === "not-allowed" || ev?.error === "service-not-allowed") {
        wakeActiveRef.current = false;
        setWakeEnabled(false);
        localStorage.setItem("uni-wake-word", "0");
        toast({ title: "Mic permission needed", description: "Allow microphone to use 'Hey Uni'.", variant: "destructive" });
      }
    };
    rec.onend = () => {
      // Auto-restart if still enabled and not currently in active listen
      if (wakeActiveRef.current && !listening) {
        try { rec.start(); } catch {
          setTimeout(() => { try { rec.start(); } catch {} }, 500);
        }
      }
    };
    wakeRef.current = rec;
    try { rec.start(); } catch {}
  };

  const toggleWakeWord = () => {
    const next = !wakeEnabled;
    setWakeEnabled(next);
    localStorage.setItem("uni-wake-word", next ? "1" : "0");
    if (next) {
      startWakeWord();
      toast({ title: "Wake word on", description: "Say “Hey Uni” anytime." });
    } else {
      stopWakeWord();
    }
  };

  // Auto-start wake word if user previously enabled it
  useEffect(() => {
    if (wakeEnabled && supported && !wakeRef.current && !listening) {
      startWakeWord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wakeEnabled, supported]);

  // Pause wake recognizer while actively listening; resume after
  useEffect(() => {
    if (listening && wakeRef.current) {
      try { wakeRef.current.stop(); } catch {}
      wakeRef.current = null;
    } else if (!listening && wakeEnabled && !wakeRef.current) {
      // brief delay so the previous SR fully releases the mic
      const t = setTimeout(() => startWakeWord(), 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, wakeEnabled]);

  const uniButton = (
    <button
      aria-label="Open Uni — voice AI assistant (like Siri)"
      title="Uni · Voice AI assistant (like Siri) — tap or say “Hey Uni”"
      onClick={() => setOpen(true)}
      className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/40 flex items-center justify-center hover:scale-110 transition-transform"
    >
      {/* Siri-like pulsing halo so users recognize this as a voice AI */}
      <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" aria-hidden="true" />
      <span className="absolute -inset-1 rounded-full border border-primary/40" aria-hidden="true" />
      <Mic className="h-6 w-6 text-white relative" />
      <span className="absolute -top-1 -right-1 bg-background text-[9px] font-black px-1.5 py-0.5 rounded-full border border-primary/40 text-primary flex items-center gap-0.5">
        <Sparkles className="h-2.5 w-2.5" /> Uni
      </span>
      <span className="absolute -bottom-6 right-0 whitespace-nowrap text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/90 text-primary-foreground shadow">
        Voice AI · like Siri
      </span>
    </button>
  );

  const fab = (
    <div className={cn(
      "flex flex-col items-end gap-2",
      !docked && "fixed bottom-24 right-4 md:right-6 z-[9998]"
    )}>
      {supported && !docked && (
        <button
          onClick={toggleWakeWord}
          aria-label={wakeEnabled ? "Disable 'Hey Uni' wake word" : "Enable 'Hey Uni' wake word"}
          title={wakeEnabled ? "Wake word ON — say “Hey Uni”" : "Enable “Hey Uni” wake word"}
          className={`h-9 px-2.5 rounded-full shadow-lg backdrop-blur-md border flex items-center gap-1.5 text-[10px] font-bold transition-all ${
            wakeEnabled
              ? "bg-primary text-primary-foreground border-primary animate-pulse"
              : "bg-background/90 text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          {wakeEnabled ? <Ear className="h-3.5 w-3.5" /> : <EarOff className="h-3.5 w-3.5" />}
          Hey Uni
        </button>
      )}
      {uniButton}
    </div>
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
              <div className="flex items-center gap-1">
                {docked && supported && (
                  <button
                    onClick={toggleWakeWord}
                    aria-label={wakeEnabled ? "Disable 'Hey Uni' wake word" : "Enable 'Hey Uni' wake word"}
                    title={wakeEnabled ? "Wake word ON — say “Hey Uni”" : "Enable “Hey Uni” wake word"}
                    className={`p-1.5 rounded-full transition-all ${
                      wakeEnabled
                        ? "bg-primary text-primary-foreground animate-pulse"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {wakeEnabled ? <Ear className="h-4 w-4" /> : <EarOff className="h-4 w-4" />}
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded">
                  <X className="h-4 w-4" />
                </button>
              </div>
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

  const captionBar = (
    <AnimatePresence>
      {caption && (listening || speaking || thinking || open) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed left-1/2 -translate-x-1/2 bottom-40 md:bottom-28 z-[9997] max-w-[92vw] md:max-w-lg pointer-events-none"
        >
          <div className={`px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border text-sm leading-snug text-center ${
            caption.role === "user"
              ? "bg-primary/90 text-primary-foreground border-primary/40"
              : "bg-background/95 text-foreground border-primary/30"
          }`}>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5">
              {caption.role === "user" ? "You" : "Uni"}
            </div>
            {caption.text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return (
    <>
      {docked ? fab : createPortal(fab, document.body)}
      {createPortal(captionBar, document.body)}
      {createPortal(modal, document.body)}
    </>
  );
}

export default UniAssistant;
