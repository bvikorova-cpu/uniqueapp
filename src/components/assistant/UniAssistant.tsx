import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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

  const [thinking, setThinking] = useState(false);
  const [typed, setTyped] = useState("");

  const [turns, setTurns] = useState<Turn[]>([]);
  const turnsRef = useRef<Turn[]>([]);
  const [caption, setCaption] = useState<{ role: "user" | "assistant"; text: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("uni-onboarding-seen") !== "1";
  });
  const captionTimerRef = useRef<number | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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

  useEffect(() => { turnsRef.current = turns; }, [turns]);

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
      if (payload?.action?.type === "navigate" && payload.action.path) {
        setTimeout(() => navigate(payload.action.path), 400);
      }
    } catch (e: any) {
      toast({ title: "Uni error", description: e?.message ?? "Try again", variant: "destructive" });
    } finally {
      setThinking(false);
    }
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    try { localStorage.setItem("uni-onboarding-seen", "1"); } catch {}
  };



  const uniButton = (
    <button
      aria-label="Open Uni — AI assistant"
      title="Uni · AI assistant — tap to chat"
      onClick={() => setOpen(true)}
      className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/40 flex items-center justify-center hover:scale-110 transition-transform"
    >
      <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" aria-hidden="true" />
      <span className="absolute -inset-1 rounded-full border border-primary/40" aria-hidden="true" />
      <Sparkles className="h-6 w-6 text-white relative" />
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
                      Chat
                    </span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">Type to chat — Uni remembers the conversation · 5 credits per reply</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
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
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold leading-snug self-center">
                      Uni chats with you like a person. Type below to get started.
                    </p>
                  </div>
                </div>
              )}
              {turns.length === 0 && !showOnboarding && (
                <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/50">
                  <p className="font-semibold mb-1">Try asking:</p>
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
                placeholder="Type your question"
                aria-label="Type a message to Uni"
                className="flex-1 h-10 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                autoFocus
              />
              <Button type="submit" size="sm" className="rounded-full" disabled={thinking || !typed.trim()}>
                {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
              </Button>
            </form>

            <p className="text-[10px] text-center text-muted-foreground">
              {thinking ? "Uni is thinking…" : "Type your question above"}
            </p>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const captionBar = (
    <AnimatePresence>
      {caption && (thinking || open) && (
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
