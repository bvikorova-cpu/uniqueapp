import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, X, Loader2, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { COWRITER_COST } from "@/hooks/useCreativeAITools";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Msg = { role: "user" | "assistant"; content: string };

interface Props {
  open: boolean;
  onClose: () => void;
  category: string;
  currentText: string;
  onInsert: (text: string) => void;
}

export const ForgeCowriterChat = ({ open, onClose, category, currentText, onInsert }: Props) => {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: `Hi! I'm your AI Co-Writer for **${category.replace("_", " ")}**. I can suggest sentences, polish your prose, brainstorm ideas, fix dialogue, or break through writer's block. What can I help you with?` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: input };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/creative-cowriter`;
      const { data: { session } } = await (await import("@/integrations/supabase/client")).supabase.auth.getSession();
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ messages: next, category, currentText }),
      });

      if (resp.status === 402) {
        const err = await resp.json();
        toast.error(err.error || "Insufficient credits");
        setLoading(false);
        return;
      }
      if (resp.status === 429) {
        toast.error("Too many requests. Please wait a moment.");
        setLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) {
        toast.error("Co-writer unavailable");
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      setMessages([...next, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") continue;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantSoFar += delta;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantSoFar };
                return copy;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Co-writer failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <FloatingHowItWorks title={"Forge Cowriter Chat - How it works"} steps={[{ title: 'Open', desc: 'Access the Forge Cowriter Chat section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Forge Cowriter Chat.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-amber-700/40 bg-[hsl(30,15%,8%)]/95 backdrop-blur-2xl shadow-[0_0_60px_rgba(251,191,36,0.2)]">
            <CardHeader className="pb-3 border-b border-amber-700/30 flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-amber-100" style={{ fontFamily: "Georgia, serif" }}>
                <Sparkles className="h-5 w-5 text-amber-400" />
                AI Co-Writer
                <Badge variant="outline" className="border-amber-600/40 text-amber-300 text-[10px] ml-2">{COWRITER_COST} cr / msg</Badge>
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-amber-200 hover:text-amber-100 hover:bg-amber-900/20">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[50vh] p-4" ref={scrollRef as any}>
                <div className="space-y-4">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === "user" ? "bg-rose-700/40 text-rose-200" : "bg-amber-700/40 text-amber-200"}`}>
                        {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`flex-1 px-3 py-2 rounded-2xl text-sm ${m.role === "user" ? "bg-rose-900/30 text-rose-50" : "bg-amber-900/20 text-amber-50"}`}>
                        <div className="prose prose-sm prose-invert max-w-none [&>p]:my-1">
                          <ReactMarkdown>{m.content || (loading && i === messages.length - 1 ? "…" : "")}</ReactMarkdown>
                        </div>
                        {m.role === "assistant" && i > 0 && m.content && !loading && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-2 h-6 text-[10px] text-amber-300 hover:text-amber-100 hover:bg-amber-800/30"
                            onClick={() => onInsert(m.content)}
                          >
                            ↓ Insert into draft
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t border-amber-700/30 p-3 flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                  placeholder="Ask for a sentence, rewrite, brainstorm…"
                  disabled={loading}
                  className="bg-black/30 border-amber-700/40 text-amber-50 placeholder:text-amber-200/40"
                />
                <Button onClick={send} disabled={loading || !input.trim()} className="bg-amber-700 hover:bg-amber-600 text-white">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    </>
  );
};
