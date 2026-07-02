import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, X, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Msg { role: "user" | "assistant"; content: string; }

interface LegalAssistantProps {
  documentType: string;
  documentText: string;
}

export const LegalAssistant = ({ documentType, documentText }: LegalAssistantProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm the **AI Legal Assistant**. Ask me anything about this document — I'll explain it in plain English. (3 credits per question)" },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("legal-ai", {
        body: { mode: "qa", question: q, documentType, documentText },
      });
      if (error) {
        const msg = (error as any)?.message ?? "";
        if (msg.includes("402") || msg.toLowerCase().includes("insufficient")) {
          toast({ title: "Not enough credits", description: "Top up to use the AI Assistant.", variant: "destructive" });
        } else {
          toast({ title: "AI error", description: msg || "Try again.", variant: "destructive" });
        }
        setMessages((m) => [...m, { role: "assistant", content: "⚠️ Sorry, I couldn't answer that. Try again later." }]);
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: (data as any)?.answer ?? "No answer." }]);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Legal Assistant - How it works"} steps={[{ title: 'Open', desc: 'Access the Legal Assistant section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Legal Assistant.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-full p-4 shadow-2xl shadow-amber-500/40 hover:scale-110 transition-transform border-2 border-amber-300/50"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">AI</span>
        </button>
      )}

      {/* Drawer */}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[calc(100vw-3rem)] sm:w-96 max-w-md h-[600px] max-h-[80vh] bg-card border-2 border-amber-400/40 rounded-2xl shadow-2xl shadow-amber-500/30 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-b border-amber-400/20">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Legal AI</h4>
                <p className="text-[10px] text-muted-foreground">Powered by Lovable AI · 3 cr/question</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X className="w-4 h-4" /></Button>
          </div>

          <div ref={scrollRef} className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-amber-500 to-yellow-600 text-white"
                      : "bg-muted/70 text-foreground"
                  }`}>
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted/70 rounded-2xl px-3 py-2 text-sm flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-amber-400" /> Thinking…
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 border-t border-amber-400/20">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about this document…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                disabled={loading}
                className="bg-background/50 border-amber-400/20"
              />
              <Button onClick={send} disabled={loading || !input.trim()} className="bg-gradient-to-r from-amber-500 to-yellow-600">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">⚠️ Informational only — not legal advice.</p>
          </div>
        </div>
      )}
    </>
    </>
  );
};
