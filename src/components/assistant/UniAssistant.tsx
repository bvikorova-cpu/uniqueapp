import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, Sparkles, X, Loader2, Volume2, VolumeX, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
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
  const [typed, setTyped] = useState("");

  const [turns, setTurns] = useState<Turn[]>([]);
  const [caption, setCaption] = useState<{ role: "user" | "assistant"; text: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("uni-onboarding-seen") !== "1";
  });
  const captionTimerRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sanitizeVisibleText = (value: string) =>
    value
      .replace(/Lovable\s+AI\s+Gateway/gi, "OpenAI")
      .replace(/Lovable\s+gateway/gi, "OpenAI")
      .replace(/AI\s+Gateway/gi, "OpenAI")
      .replace(/Switching\s+to\s+OpenAI\s+for\s*\.\.\.?/gi, "Connecting to OpenAI…")
      .trim();

  const showCaption = (role: "user" | "assistant", text: string, autoHideMs?: number) => {
    if (captionTimerRef.current) window.clearTimeout(captionTimerRef.current);
    setCaption({ role, text: sanitizeVisibleText(text) });
    if (autoHideMs) {
      captionTimerRef.current = window.setTimeout(() => setCaption(null), autoHideMs);
    }
  };
  const recognitionRef = useRef<any>(null);
  const latestHeardRef = useRef<string>("");
  const sentRef = useRef(false);
  const silenceTimerRef = useRef<number | null>(null);
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, transcript, thinking, showOnboarding]);

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
    speakBrowser(text);
  };

  const send = async (text: string) => {
    if (!text.trim()) return;
    setTurns((t) => [...t, { role: "user", content: text }]);
    showCaption("user", text);
    setThinking(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: { type: "uni_assistant", transcript: text, currentRoute: location.pathname } });

      let payload: any = data;
      if (error) {
        let status: number | undefined;
        try {
          const ctx = (error as any)?.context;
          if (ctx && typeof ctx.json === "function") {
            payload = await ctx.json();
            status = typeof ctx.status === "number" ? ctx.status : undefined;
          }
        } catch { /* keep generic */ }
        const code = String(payload?.error ?? "");
        if (status === 401 || /not authenticated|auth_required|unauthor/i.test(code)) {
          const msg = "Please sign in to talk to me.";
          setTurns((t) => [...t, { role: "assistant", content: msg }]);
          showCaption("assistant", msg, 6000);
          toast({ title: "Sign in required", description: "Uni needs a signed-in account.", variant: "destructive" });
          setTimeout(() => navigate("/auth"), 800);
          return;
        }
        if (status === 402 || /insufficient/i.test(code)) {
          payload = { error: "INSUFFICIENT_CREDITS" };
        } else if (status === 429 || /rate limit/i.test(code)) {
          const msg = "I'm getting a lot of requests right now — try again in a moment.";
          setTurns((t) => [...t, { role: "assistant", content: msg }]);
          showCaption("assistant", msg, 6000);
          return;
        } else if (!payload?.reply && !payload?.error) {
          throw error;
        }
      }

      if (payload?.error === "INSUFFICIENT_CREDITS") {
        toast({ title: "Not enough credits", description: "Uni costs 3 credits per command.", variant: "destructive" });
        const msg = "You need 3 credits to use me. Top up in Wallet.";
        setTurns((t) => [...t, { role: "assistant", content: msg }]);
        showCaption("assistant", msg, 6000);
        return;
      }
      if (payload?.error) throw new Error(String(payload.error));
      const reply = sanitizeVisibleText(payload?.reply ?? payload?.message ?? payload?.text ?? payload?.result ?? "Okay.");
      setTurns((t) => [...t, { role: "assistant", content: reply }]);
      showCaption("assistant", reply);
      speak(reply);
      if (payload?.action?.type === "navigate" && payload.action.path) {
        setTimeout(() => navigate(payload.action.path), 400);
      }
    } catch (e: any) {
      toast({ title: "Uni error", description: e?.message ?? "Try again", variant: "destructive" });
    } finally {
      setThinking(false);
      setTranscript("");
    }
  };

  const startListening = async () => {
    if (!supported) {
      toast({
        title: "Voice not supported",
        description: "This browser has no speech recognition — type your question below instead.",
        variant: "destructive",
      });
      return;
    }

    const inIframe = typeof window !== "undefined" && window.self !== window.top;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      toast({
        title: "Microphone blocked",
        description: inIframe
          ? "The preview window can't use the microphone. Open the app in its own browser tab (or install the app) and tap the mic again."
          : "Allow microphone access in your browser settings, then tap the mic again.",
        variant: "destructive",
        action: inIframe ? (
          <ToastAction altText="Open in new tab" onClick={() => window.open(window.location.href, "_blank", "noopener")}>
            Open app
          </ToastAction>
        ) : undefined,
      });
      return;
    }

    stopSpeaking();
    try { recognitionRef.current?.abort?.(); } catch { /* noop */ }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = navigator.language || "en-US";

    latestHeardRef.current = "";
    sentRef.current = false;

    const clearSilence = () => {
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };

    const finalise = (reason: "silence" | "end") => {
      clearSilence();
      const heard = latestHeardRef.current.trim();
      if (sentRef.current) return;
      if (heard) {
        sentRef.current = true;
        try { rec.stop(); } catch { /* noop */ }
        setListening(false);
        send(heard);
      } else if (reason === "end") {
        setListening(false);
        toast({
          title: "I didn't catch that",
          description: "Speak a bit closer to the mic, or type your question below.",
        });
      }
    };

    rec.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript + " ";
        else interim += r[0].transcript + " ";
      }
      const live = (final + interim).trim();
      if (live) {
        latestHeardRef.current = live;
        setTranscript(live);
        showCaption("user", live);
      }
      clearSilence();
      silenceTimerRef.current = window.setTimeout(() => finalise("silence"), 1300);
    };
    rec.onspeechend = () => {
      clearSilence();
      silenceTimerRef.current = window.setTimeout(() => finalise("silence"), 800);
    };
    rec.onerror = (e: any) => {
      const code = String(e?.error ?? "");
      if (code === "aborted") return;
      if (code === "no-speech") {
        finalise("end");
        return;
      }
      clearSilence();
      setListening(false);
      const description =
        code === "not-allowed" || code === "service-not-allowed"
          ? "Microphone access was denied. Allow it in your browser settings and try again."
          : code === "network"
            ? "Speech recognition needs an internet connection."
            : "Voice input failed. You can type your question below.";
      toast({ title: "Voice call failed", description, variant: "destructive" });
    };
    rec.onend = () => finalise("end");
    recognitionRef.current = rec;
    setListening(true);
    setTranscript("");
    try {
      rec.start();
    } catch {
      setListening(false);
      toast({
        title: "Couldn't start the mic",
        description: "Close other tabs using the microphone and try again.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop?.(); } catch {}
    setListening(false);
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    try { localStorage.setItem("uni-onboarding-seen", "1"); } catch {}
  };

  const statusText = listening
    ? "Listening…"
    : thinking
      ? "Uni is thinking…"
      : speaking
        ? "Uni is speaking…"
        : supported
          ? "Tap the mic and speak, or type below"
          : "Voice input is unavailable — type below";

  const uniButton = (
    <button
      aria-label="Open Uni — AI assistant"
      title="Uni · AI assistant"
      onClick={() => setOpen(true)}
      className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform duration-200 border border-primary/20"
    >
      <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse" aria-hidden="true" />
      <Sparkles className="h-6 w-6 text-primary-foreground relative" />
    </button>
  );

  const fab = (
    <div className={cn(
      "flex flex-col items-end gap-2",
      docked && "hidden md:flex",
      !docked && "fixed bottom-28 right-4 md:bottom-24 md:right-6 z-[9991]"
    )}>
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
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full md:max-w-md bg-card border-t md:border md:rounded-3xl border-border shadow-2xl shadow-primary/10 flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/80 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                  {(listening || thinking || speaking) && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success animate-pulse border-2 border-card" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight">Uni Assistant</p>
                  <p className="text-[11px] text-muted-foreground">Voice & text AI · 3 credits per command</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-[160px]">
              {showOnboarding && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 to-accent/8 p-4"
                >
                  <button
                    onClick={dismissOnboarding}
                    aria-label="Dismiss onboarding"
                    className="absolute top-2 right-2 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex items-start gap-3 pr-5">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-md">
                      <Mic className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-snug mb-1">
                        Meet Uni — your platform assistant
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Tap the microphone and ask naturally, or type your request. Uni can navigate, explain features, and help you get things done faster.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {turns.length === 0 && !showOnboarding && (
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Try asking</p>
                  <div className="grid grid-cols-1 gap-2">
                    {["Open Megatalent", "Go to my wallet", "Motivate me today", "Show the mentor hub"].map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-left text-sm px-3 py-2 rounded-lg bg-background border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {turns.map((t, i) => (
                <div key={i} className={cn("flex gap-3", t.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                    t.role === "user"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border"
                  )}>
                    {t.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={cn(
                    "text-sm px-4 py-3 rounded-2xl max-w-[80%] leading-relaxed shadow-sm",
                    t.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm border border-border"
                  )}>
                    {t.content}
                  </div>
                </div>
              ))}

              {transcript && listening && (
                <div className="flex gap-3 flex-row-reverse">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground border border-primary flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-sm px-4 py-3 rounded-2xl rounded-tr-sm bg-primary/10 border border-primary/20 text-foreground max-w-[80%] italic">
                    {transcript}…
                  </div>
                </div>
              )}

              {thinking && (
                <div className="flex gap-3 flex-row">
                  <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground border border-border flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="text-sm px-4 py-3 rounded-2xl rounded-tl-sm bg-muted border border-border text-muted-foreground">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0.3s]" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="px-5 py-4 border-t border-border bg-card/80 backdrop-blur-md shrink-0 space-y-3">
              <div className="flex items-center justify-center gap-4">
                {listening ? (
                  <Button onClick={stopListening} variant="destructive" size="lg" className="rounded-full h-14 w-14 p-0 shadow-lg">
                    <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                      <Mic className="h-6 w-6" />
                    </motion.div>
                  </Button>
                ) : thinking ? (
                  <Button disabled size="lg" className="rounded-full h-14 w-14 p-0 shadow-lg">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </Button>
                ) : speaking ? (
                  <Button onClick={stopSpeaking} size="lg" className="rounded-full h-14 w-14 p-0 shadow-lg" variant="secondary">
                    <Volume2 className="h-6 w-6" />
                  </Button>
                ) : (
                  <Button onClick={startListening} size="lg" className="rounded-full h-14 w-14 p-0 bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-shadow">
                    <Mic className="h-6 w-6" />
                  </Button>
                )}
                {speaking && (
                  <Button onClick={stopSpeaking} variant="outline" size="icon" className="rounded-full h-10 w-10" aria-label="Stop speaking">
                    <VolumeX className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const value = typed.trim();
                  if (!value || thinking) return;
                  setTyped("");
                  send(value);
                }}
              >
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="Type your request…"
                  aria-label="Type a message to Uni"
                  className="flex-1 h-11 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <Button type="submit" size="icon" className="rounded-full h-11 w-11 shrink-0" disabled={thinking || !typed.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>

              <p className="text-[11px] text-center text-muted-foreground font-medium">
                {statusText}
              </p>
            </div>
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
          <div className={`px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md border text-sm leading-snug text-center ${
            caption.role === "user"
              ? "bg-primary/95 text-primary-foreground border-primary/40"
              : "bg-card/95 text-foreground border-primary/30"
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
