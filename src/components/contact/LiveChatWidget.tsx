import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, Send, X, Loader2, Sparkles, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { CSATWidget } from "./CSATWidget";

interface Msg { role: "user" | "assistant"; content: string }

const STORAGE_KEY = "unique:contact-livechat";
const HIDDEN_KEY = "unique:contact-livechat:hidden";

export const LiveChatWidget = () => {
  const { pathname } = useLocation();
  const [hidden, setHidden] = useState<boolean>(() => {
    try { return localStorage.getItem(HIDDEN_KEY) === "1"; } catch { return false; }
  });


  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null)); }, []);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Msg[]) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30))); } catch {}
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("contact-ai-triage", {
        body: { action: "live_chat", messages: next },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "…" }]);
    } catch (e: any) {
      toast.error(e.message || "Chat unavailable");
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't reach the assistant. Please submit a ticket below." }]);
    } finally { setLoading(false); }
  };

  const clear = () => { setMessages([]); localStorage.removeItem(STORAGE_KEY); };

  const hide = () => {
    try { localStorage.setItem(HIDDEN_KEY, "1"); } catch {}
    setHidden(true);
  };

  const show = () => {
    try { localStorage.removeItem(HIDDEN_KEY); } catch {}
    setHidden(false);
    setOpen(true);
  };

  if (hidden) {
    return (
      <button
        onClick={show}
        className="fixed bottom-3 right-3 z-50 flex items-center gap-1 rounded-full border border-border bg-background/80 backdrop-blur px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:opacity-100 opacity-60 transition shadow"
        aria-label="Show assistant"
        title="Show AI assistant"
      >
        <Sparkles className="h-3 w-3 text-primary" />
        Show chat
      </button>
    );
  }

  return (
    <>
      {!open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-1">
          <button
            onClick={hide}
            className="opacity-60 hover:opacity-100 bg-background/80 backdrop-blur border border-border rounded-full p-1 transition"
            aria-label="Hide assistant"
            title="Hide on all pages"
          >
            <X className="h-3 w-3" />
          </button>
          <Button
            onClick={() => setOpen(true)}
            className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/40 hover:scale-105 transition"
            aria-label="Open live chat"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      )}

      {open && (
        <Card className="fixed bottom-6 right-6 z-50 w-[min(380px,calc(100vw-2rem))] h-[min(560px,calc(100vh-3rem))] flex flex-col shadow-2xl border-primary/30 bg-background/95 backdrop-blur-xl">
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-semibold">Unique Assistant</div>
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">AI · online</Badge>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={clear}>Clear</Button>
              )}
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={hide} aria-label="Hide assistant" title="Hide on all pages">
                <EyeOff className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground space-y-2">
                <p>👋 Hi! I'm the Unique AI assistant. Ask me anything — account, credits, subscriptions, payouts.</p>
                <p className="text-xs">If you need a human, please submit a ticket via the form below.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                }`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Assistant is typing…
              </div>
            )}
          </div>

          {messages.length >= 4 && userId && (
            <div className="px-3 pb-2">
              <CSATWidget userId={userId} channel="live_chat" />
            </div>
          )}

          <div className="p-3 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Type a message…"
              disabled={loading}
            />
            <Button onClick={send} disabled={loading || !input.trim()} size="icon" className="bg-gradient-to-br from-primary to-accent">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default LiveChatWidget;
