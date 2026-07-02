import { useState } from "react";
import { Loader2, MessageCircle, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Msg { role: "user" | "ai"; text: string; }

export const AIChatFollowup = ({ context }: { context: string }) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const fullContext = `${context}\n\nPrior chat:\n${messages.map(m => `${m.role}: ${m.text}`).join("\n")}`;
      const { data, error } = await supabase.functions.invoke("analyzer-ai", {
        body: { action: "chat-followup", context: fullContext, question },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages((m) => [...m, { role: "ai", text: data.result }]);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: cred } = await supabase.from("analyzer_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
        if (cred) {
          await supabase.from("analyzer_credits")
            .update({ credits_remaining: Math.max(0, (cred.credits_remaining ?? 0) - 1) })
            .eq("user_id", user.id);
        }
      }
    } catch (e: any) { toast.error(e.message || "Chat failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Chat Followup - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Chat Followup section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Chat Followup.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-6 border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-background">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-bold">Ask Follow-up Questions</h2>
        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">1 CR / message</Badge>
      </div>
      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            <Sparkles className="inline w-4 h-4 mr-1" />
            Ask anything about this analysis — clarification, more depth, alternatives.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded-lg ${m.role === "user" ? "bg-cyan-500/10 ml-8" : "bg-muted mr-8"}`}>
            <div className="text-[10px] uppercase font-bold text-cyan-400 mb-1">{m.role === "user" ? "You" : "AI"}</div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{m.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && <div className="text-sm text-muted-foreground"><Loader2 className="inline w-4 h-4 animate-spin mr-2" />Thinking…</div>}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Ask a follow-up…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && send()}
          className="border-cyan-500/20"
        />
        <Button onClick={send} disabled={loading || !input.trim()} className="bg-gradient-to-r from-cyan-600 to-blue-600">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
    </>
  );
};
