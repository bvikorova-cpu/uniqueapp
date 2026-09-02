import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, Sparkles, X, Loader2, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useOverlayOpen } from "@/hooks/useOverlayOpen";
import { UNI_OPEN_EVENT, useAssistantsHidden, useOpenRequest, setAssistantsHidden } from "@/lib/assistantBus";


type Turn = { role: "user" | "assistant"; content: string };

interface UniAssistantProps {
  /** When true, the floating trigger is rendered inline (no fixed positioning)
   *  so it can be placed inside a shared dock such as FloatingAssistantDock. */
  docked?: boolean;
}

export function UniAssistant({ docked = false }: UniAssistantProps) {
  const overlayOpen = useOverlayOpen();
  const [open, setOpen] = useState(false);
  const assistantsHidden = useAssistantsHidden();
  useOpenRequest(UNI_OPEN_EVENT, () => setOpen(true));

  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [typed, setTyped] = useState("");

  const [turns, setTurns] = useState<Turn[]>([]);
  const [handsFree, setHandsFree] = useState(false);
  const turnsRef = useRef<Turn[]>([]);
  const handsFreeRef = useRef(false);
  const openRef = useRef(false);
  const [caption, setCaption] = useState<{ role: "user" | "assistant"; text: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("uni-onboarding-seen") !== "1";
  });
  const captionTimerRef = useRef<number | null>(null);

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


  useEffect(() => { turnsRef.current = turns; }, [turns]);
  useEffect(() => { handsFreeRef.current = handsFree; }, [handsFree]);
  useEffect(() => {
    openRef.current = open;
    if (!open) {
      setHandsFree(false);
      stopSpeaking();
      try { recognitionRef.current?.abort?.(); } catch { /* noop */ }
      setListening(false);
    }
  }, [open]);
  // Voice lists load asynchronously in most browsers — warm them up early.
  useEffect(() => {
    try { window.speechSynthesis?.getVoices?.(); } catch { /* noop */ }
  }, []);
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

  /** Strip markdown / symbols a human would never read out loud. */
  const toSpeech = (text: string) =>
    text
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/[*_`#>]/g, "")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
      .replace(/^\s*[-•]\s*/gm, "")
      .replace(/\s+/g, " ")
      .trim();

  /** Language the UI (and therefore the conversation) is currently in. */
  const uiLang = () => {
    try {
      const stored = localStorage.getItem("preferred_language");
      if (stored) return stored;
    } catch { /* noop */ }
    return (document.documentElement.lang || navigator.language || "en").split("-")[0];
  };

  /** Detect the language actually used in a piece of text, so a Spanish answer is
   *  never read out by an English voice (which is what causes a heavy accent). */
  const detectLang = (text: string): string => {
    const t = text.toLowerCase();
    if (/[\u3040-\u30ff]/.test(text)) return "ja";
    if (/[\uac00-\ud7af]/.test(text)) return "ko";
    if (/[\u4e00-\u9fff]/.test(text)) return "zh";
    if (/[\u0400-\u04ff]/.test(text)) return "ru";
    if (/[\u0600-\u06ff]/.test(text)) return "ar";
    const hints: Record<string, RegExp> = {
      sk: /\b(ďakujem|prosím|môžeš|nájdeš|takže|nie je|ahoj|kredity|stránke)\b|[ľĺňŕôä]/,
      cs: /\b(děkuji|prosím|můžeš|najdeš|takže|ahoj|jsem|jsi)\b|[ěřůň]/,
      de: /\b(und|nicht|ich|kannst|bitte|danke|deine|hier|sind)\b|[äöüß]/,
      es: /\b(y|para|puedes|gracias|por favor|tus|está|aquí|hola)\b|[ñ¿¡]/,
      fr: /\b(et|pour|vous|merci|s'il|votre|ici|bonjour|est)\b|[çœ]/,
      it: /\b(e|per|puoi|grazie|tuo|qui|ciao|sono|della)\b/,
      hu: /\b(és|nem|köszönöm|kérem|tudsz|itt|szia|van)\b|[őű]/,
      pl: /\b(dziękuję|proszę|możesz|jest|tutaj|cześć)\b|[ąęśćźżł]/,
    };
    const scores = Object.entries(hints)
      .map(([code, rx]) => [code, (t.match(new RegExp(rx.source, "gi")) ?? []).length] as const)
      .sort((a, b) => b[1] - a[1]);
    if (scores[0] && scores[0][1] >= 2) return scores[0][0];
    if (/\b(the|and|you|your|here|please|thanks|can)\b/.test(t)) return "en";
    return uiLang();
  };

  /** Pick a natural-sounding voice that natively speaks `lang`. */
  const pickVoice = (lang: string) => {
    const voices = window.speechSynthesis?.getVoices?.() ?? [];
    if (!voices.length) return null;
    const base = lang.split("-")[0].toLowerCase();
    let pool = voices.filter((v) => v.lang?.toLowerCase().replace("_", "-").startsWith(base));
    // No native voice installed for this language: fall back to the browser
    // default rather than forcing a mismatched (accented) voice.
    if (!pool.length) pool = voices.filter((v) => v.default);
    if (!pool.length) return null;
    const preferred = [/neural/i, /natural/i, /premium/i, /enhanced/i, /siri/i, /google/i, /microsoft/i];
    for (const rx of preferred) {
      const hit = pool.find((v) => rx.test(v.name));
      if (hit) return hit;
    }
    return pool[0] ?? null;
  };

  const speakBrowser = (text: string, onDone?: () => void) => {
    try {
      window.speechSynthesis.cancel();
      const clean = toSpeech(text);
      if (!clean) { onDone?.(); return; }
      const lang = detectLang(clean);
      const voice = pickVoice(lang);
      // Split into sentences so pauses land where a person would breathe.
      const parts = clean.match(/[^.!?…]+[.!?…]*/g)?.map((p) => p.trim()).filter(Boolean) ?? [clean];
      setSpeaking(true);
      parts.forEach((part, i) => {
        const u = new SpeechSynthesisUtterance(part);
        if (voice) u.voice = voice;
        // Always tag the utterance with the text's own language so engines with
        // multilingual voices switch pronunciation instead of adding an accent.
        u.lang = voice?.lang && voice.lang.toLowerCase().startsWith(lang) ? voice.lang : lang;
        u.rate = 0.98;
        u.pitch = 1;
        u.volume = 1;
        if (i === parts.length - 1) {
          u.onend = () => { setSpeaking(false); onDone?.(); };
          u.onerror = () => { setSpeaking(false); onDone?.(); };
        }
        window.speechSynthesis.speak(u);
      });
    } catch {
      setSpeaking(false);
      onDone?.();
    }
  };

  const speak = async (text: string, onDone?: () => void) => {
    stopSpeaking();
    const clean = toSpeech(text);
    if (!clean) { onDone?.(); return; }
    const lang = detectLang(clean);

    // Preferred path: neural TTS with a native-speaker pronunciation profile for
    // the detected language (correct phonemes, stress and intonation, no accent).
    try {
      const { data, error } = await supabase.functions.invoke("uni-tts", {
        body: { text: clean.slice(0, 800), lang },
      });
      if (!error && data instanceof Blob && data.size > 1000) {
        const audio = new Audio(URL.createObjectURL(data));
        audioRef.current = audio;
        setSpeaking(true);
        audio.onended = () => { setSpeaking(false); audioRef.current = null; onDone?.(); };
        audio.onerror = () => { setSpeaking(false); audioRef.current = null; speakBrowser(text, onDone); };
        await audio.play();
        return;
      }
    } catch { /* fall through to the browser voice */ }


    // Fallback: best installed native voice for the detected language.
    speakBrowser(text, onDone);
  };



  const send = async (text: string) => {
    if (!text.trim()) return;
    setTurns((t) => [...t, { role: "user", content: text }]);
    showCaption("user", text);
    setThinking(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "uni_assistant",
          transcript: text,
          currentRoute: location.pathname,
          // Full conversation so Uni remembers the thread like a person would.
          history: turnsRef.current.slice(-14),
        } });

      // The Supabase SDK collapses every non-2xx response into a generic
      // "non-2xx status code" error and hides the real body on error.context.
      // Unwrap it so Uni can react to 401 / 402 / 429 properly.
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
        toast({ title: "Not enough credits", description: "Uni costs 5 credits per command.", variant: "destructive" });
        const msg = "You need 5 credits to use me. Top up in Wallet.";
        setTurns((t) => [...t, { role: "assistant", content: msg }]);
        showCaption("assistant", msg, 6000);
        return;
      }
      if (payload?.error) throw new Error(String(payload.error));
      const reply = sanitizeVisibleText(payload?.reply ?? payload?.message ?? payload?.text ?? payload?.result ?? "Okay.");
      setTurns((t) => [...t, { role: "assistant", content: reply }]);
      showCaption("assistant", reply);
      speak(reply, () => {
        // Hands-free conversation: reopen the mic as soon as Uni stops talking.
        if (handsFreeRef.current && openRef.current) {
          window.setTimeout(() => {
            if (handsFreeRef.current && openRef.current) void startListening();
          }, 250);
        }
      });
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

    // Ask for the microphone explicitly first: on mobile, SpeechRecognition
    // often fails silently ("not-allowed") when permission was never granted.
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


    // Speaking output would be picked up by the mic — stop it before listening.
    stopSpeaking();
    try { recognitionRef.current?.abort?.(); } catch { /* noop */ }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    // Continuous + interim keeps the session alive on mobile, where a short pause
    // otherwise ends recognition before any final result is emitted.
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    // Listen in the language the user picked in the app, so foreign speech is
    // transcribed natively instead of being forced through English phonetics.
    rec.lang = (() => {
      const base = uiLang();
      const map: Record<string, string> = {
        en: "en-US", sk: "sk-SK", cs: "cs-CZ", de: "de-DE", es: "es-ES", fr: "fr-FR",
        it: "it-IT", hu: "hu-HU", ru: "ru-RU", ja: "ja-JP", ko: "ko-KR", zh: "zh-CN",
      };
      return map[base] || navigator.language || "en-US";
    })();


    // Buffer everything we hear; we finalise ourselves after a short silence so
    // nothing is lost when the engine never flags a result as final.
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
        // In hands-free mode silence is normal — keep quiet and just wait for the
        // user to tap again instead of nagging with a toast every pause.
        if (!handsFreeRef.current) {
          toast({
            title: "I didn't catch that",
            description: "Speak a bit closer to the mic, or type your question below.",
          });
        }
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
        // Not fatal in continuous mode — keep whatever we already heard.
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



  const uniButton = (
    <button
      aria-label="Open Uni — voice AI assistant (like Siri)"
      title="Uni · Voice AI assistant (like Siri) — tap to talk"
      onClick={() => setOpen(true)}
      className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/40 flex items-center justify-center hover:scale-110 transition-transform"
    >
      {/* Siri-like pulsing halo so users recognize this as a voice AI */}
      <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" aria-hidden="true" />
      <span className="absolute -inset-1 rounded-full border border-primary/40" aria-hidden="true" />
      <Mic className="h-6 w-6 text-white relative" />
    </button>
  );

  const fab = overlayOpen && !docked && !open ? null : (
    <div className={cn(
      "flex flex-col items-start gap-2",
      docked && "hidden md:flex",
      // On mobile Uni lives in the bottom navigation bar instead of floating.
      !docked && "hidden md:flex fixed bottom-24 left-3 md:bottom-24 md:left-6 z-[9991]",
      !docked && overlayOpen && "hidden",
      !docked && assistantsHidden && "hidden"
    )}>
      {uniButton}
      {!docked && (
        <button
          type="button"
          onClick={() => setAssistantsHidden(true)}
          aria-label="Hide Uni and translator buttons"
          title="Hide Uni & translator"
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-background/80 backdrop-blur border border-border/60 text-muted-foreground hover:text-foreground"
        >
          Hide
        </button>
      )}
    </div>
  );

  /** Small always-visible pill to bring the hidden assistants back (desktop). */
  const restorePill = !docked && assistantsHidden && !overlayOpen ? (
    <button
      type="button"
      onClick={() => setAssistantsHidden(false)}
      aria-label="Show Uni and translator"
      title="Show Uni & translator"
      className="hidden md:flex fixed bottom-6 left-3 md:left-6 z-[9991] items-center gap-1.5 px-3 py-2 rounded-full bg-background/85 backdrop-blur-xl border border-primary/40 shadow-lg shadow-primary/20 text-xs font-bold text-primary"
    >
      <Sparkles className="h-3.5 w-3.5" />
      <span className="notranslate" translate="no">Uni</span> 🌐
    </button>
  ) : null;


  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
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
                  <p className="font-black text-sm flex items-center gap-1.5">
                    <span className="notranslate" translate="no">Uni</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                      Voice & chat
                    </span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">Talk or type — Uni remembers the conversation · 5 credits per reply</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const next = !handsFree;
                    setHandsFree(next);
                    handsFreeRef.current = next;
                    if (next && !listening && !thinking && !speaking) void startListening();
                    if (!next) { stopSpeaking(); stopListening(); }
                  }}
                  aria-pressed={handsFree}
                  title="Hands-free conversation — Uni keeps listening after each answer"
                  className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full border transition-colors",
                    handsFree
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/60 text-muted-foreground border-border hover:text-foreground"
                  )}
                >
                  {handsFree ? "Conversation on" : "Conversation"}
                </button>
                <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 min-h-[120px]">
              {showOnboarding && (
                <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 p-3">
                  <button
                    onClick={dismissOnboarding}
                    aria-label="Dismiss onboarding"
                    className="absolute top-1.5 right-1.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex items-start gap-3 pr-6">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg">
                      <Mic className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold leading-snug self-center">
                      Uni talks with you like a person. Tap the mic to speak, or type below — turn on "Conversation" for hands-free back-and-forth.
                    </p>
                  </div>
                </div>
              )}
              {turns.length === 0 && !showOnboarding && (
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
                <Button
                  onClick={() => { stopSpeaking(); void startListening(); }}
                  title="Interrupt Uni and speak"
                  size="lg"
                  className="rounded-full h-14 w-14 p-0"
                  variant="secondary"
                >
                  <Volume2 className="h-6 w-6" />
                </Button>
              ) : (
                <Button onClick={startListening} size="lg" className="rounded-full h-14 w-14 p-0 bg-gradient-to-br from-primary to-accent">
                  <Mic className="h-6 w-6" />
                </Button>
              )}
            </div>

            {/* Text fallback — works even when the browser has no speech
                recognition or the mic permission is blocked. */}
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
                placeholder="…or type your question"
                aria-label="Type a message to Uni"
                className="flex-1 h-10 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary"
              />
              <Button type="submit" size="sm" className="rounded-full" disabled={thinking || !typed.trim()}>
                Send
              </Button>
            </form>

            <p className="text-[10px] text-center text-muted-foreground">
              {listening ? "Listening…" : thinking ? "Uni is thinking…" : speaking ? "Uni is speaking…" : supported ? "Tap the mic and speak, or type below" : "Voice input is unavailable in this browser — type below"}
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
      {restorePill ? createPortal(restorePill, document.body) : null}

      {createPortal(captionBar, document.body)}
      {createPortal(modal, document.body)}
    </>
  );
}

export default UniAssistant;
