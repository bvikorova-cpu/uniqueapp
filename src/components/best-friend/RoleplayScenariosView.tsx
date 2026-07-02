import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Loader2, Drama } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const SCENARIOS = [
  { id: "interview", label: "💼 Job Interview", desc: "Practice tough interview questions" },
  { id: "hard_talk", label: "💬 Difficult Conversation", desc: "Boss, partner, parent" },
  { id: "dating", label: "💕 First Date", desc: "Practice flirting & connection" },
  { id: "presentation", label: "🎤 Q&A After Presentation", desc: "Tough audience questions" },
  { id: "conflict", label: "⚖️ De-escalate Conflict", desc: "Practice staying calm" },
  { id: "small_talk", label: "☕ Small Talk", desc: "Cafes, parties, networking" },
];

const CHAT_URL = `https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/best-friend-roleplay`;

export const RoleplayScenariosView = () => {
  const [scenario, setScenario] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const start = (id: string) => {
    setScenario(id);
    setMessages([{ role: "assistant", content: "*sets the scene* Whenever you're ready, begin." }]);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim(); setInput("");
    const newMsgs = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMsgs); setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sign in");
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ scenario_id: scenario, messages: newMsgs }),
      });
      if (!resp.ok || !resp.body) throw new Error("Failed");
      const reader = resp.body.getReader(); const dec = new TextDecoder();
      let buf = "", asst = "";
      setMessages(p => [...p, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim(); if (j === "[DONE]") break;
          try {
            const c = JSON.parse(j).choices?.[0]?.delta?.content;
            if (c) { asst += c; setMessages(p => { const n = [...p]; n[n.length - 1] = { role: "assistant", content: asst }; return n; }); }
          } catch {}
        }
      }
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  if (!scenario) return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Roleplay Scenarios View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
          <Drama className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-black">Roleplay Scenarios</h2>
        <p className="text-muted-foreground mt-2">Practice real-life conversations safely</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {SCENARIOS.map(s => (
          <Card key={s.id} className="cursor-pointer hover:border-orange-500/50 transition-all" onClick={() => start(s.id)}>
            <CardContent className="p-4">
              <div className="font-bold">{s.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Button variant="ghost" onClick={() => { setScenario(null); setMessages([]); }}>← Pick another scenario</Button>
      <Card><CardContent className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 ${m.role === "user" ? "bg-gradient-to-r from-orange-600 to-red-600 text-white" : "bg-card border"}`}>
              <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{m.content}</ReactMarkdown></div>
            </div>
          </div>
        ))}
      </CardContent></Card>
      <div className="flex gap-2">
        <Textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Your line..." className="resize-none" />
        <Button onClick={send} disabled={loading || !input.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
        </Button>
      </div>
    </div>
  );
};
