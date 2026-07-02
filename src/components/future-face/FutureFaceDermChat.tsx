import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { handleEdgeError, throwIfInvokeError } from "@/lib/handleEdgeError";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Msg { role: "user" | "assistant"; content: string; }

export default function FutureFaceDermChat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "👋 Hi! I'm your AI Dermatologist. Describe your skin concern, age, and any symptoms — I'll provide a clinical-style assessment. (6 credits per consultation)" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    const conv = [...msgs, { role: "user" as const, content: userMsg }];
    setMsgs(conv);
    setInput("");
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      // Build context-aware prompt: include short history
      const historyContext = conv.slice(-6).map(m => `${m.role === "user" ? "PATIENT" : "DERMATOLOGIST"}: ${m.content}`).join("\n\n");
      const res = await supabase.functions.invoke("future-face-ai", {
        body: { action: "dermatologist_review", prompt: historyContext, age: 30 },
      });
      const data = throwIfInvokeError(res);
      setMsgs(m => [...m, { role: "assistant", content: data.result }]);
    } catch (err: any) {
      if (!handleEdgeError(err, { navigate, context: "Derm Chat" })) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
      setMsgs(m => m.slice(0, -1)); // rollback user msg on hard fail
    } finally { setBusy(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Future Face Derm Chat - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face Derm Chat section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face Derm Chat.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">🩺 AI Dermatologist Chat</h2>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">6 CR / msg</Badge>
      </div>
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {msgs.map((m, i) => (
              <div key={i} className={`p-3 rounded-xl text-sm ${m.role === "user" ? "bg-cyan-500/10 border border-cyan-500/20 ml-8" : "bg-card/80 border border-border mr-8"}`}>
                <p className="text-[10px] uppercase font-bold mb-1 opacity-60">{m.role === "user" ? "You" : "Dermatologist"}</p>
                <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{m.content}</ReactMarkdown></div>
              </div>
            ))}
            {busy && (
              <div className="bg-card/80 border border-border rounded-xl p-3 mr-8 flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-2 border-t border-border/40">
            <Textarea value={input} onChange={e => setInput(e.target.value)}
              placeholder="Describe your skin concern, symptoms, age, lifestyle…"
              rows={2}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <Button onClick={send} disabled={busy || !input.trim()} className="bg-gradient-to-r from-cyan-600 to-purple-600">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
