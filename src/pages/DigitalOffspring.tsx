import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Baby, Loader2, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

type Offspring = {
  id: string;
  name: string;
  personality_data?: any;
  last_interaction_at?: string;
};
type Msg = { role: "user" | "assistant"; message: string; id?: string };

export default function DigitalOffspring() {
  const { user } = useAuth();
  const [list, setList] = useState<Offspring[]>([]);
  const [active, setActive] = useState<Offspring | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("digital_offspring")
        .select("id,name,personality_data,last_interaction_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setList(data ?? []);
      if (data?.length && !active) setActive(data[0]);
    })();
  }, [user]);

  useEffect(() => {
    if (!active) return;
    (async () => {
      const { data } = await supabase
        .from("digital_offspring_conversations")
        .select("id,role,message")
        .eq("offspring_id", active.id)
        .order("created_at", { ascending: true })
        .limit(50);
      setMessages(
        (data ?? []).map((m: any) => ({ id: m.id, role: m.role === "assistant" ? "assistant" : "user", message: m.message }))
      );
      requestAnimationFrame(() => scroller.current?.scrollTo({ top: 9e9, behavior: "smooth" }));
    })();
  }, [active]);

  const create = async () => {
    if (!name.trim()) return toast.error("Enter a name");
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-digital-offspring", {
        body: { name: name.trim() },
      });
      if (error) throw error;
      const o = data?.offspring as Offspring;
      setList((l) => [o, ...l]);
      setActive(o);
      setName("");
      toast.success(`${o.name} was born`);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to create offspring");
    } finally {
      setCreating(false);
    }
  };

  const send = async () => {
    if (!active || !input.trim()) return;
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", message: text }]);
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat-with-offspring", {
        body: { offspringId: active.id, message: text },
      });
      if (error) throw error;
      setMessages((m) => [...m, { role: "assistant", message: data?.reply ?? "..." }]);
      requestAnimationFrame(() => scroller.current?.scrollTo({ top: 9e9, behavior: "smooth" }));
    } catch (e: any) {
      toast.error(e.message ?? "Chat failed");
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-3">Digital Offspring</h1>
          <p className="text-muted-foreground mb-6">Sign in to meet your AI offspring.</p>
          <Button onClick={() => (window.location.href = "/auth?redirect=/digital-offspring")}>Sign in</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-4">
            <Baby className="w-4 h-4" /> Digital Offspring
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Meet your AI child</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Seed a digital offspring from your DNA & personality and chat with them in real time.
          </p>
        </header>

        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Create new</CardTitle>
                <CardDescription>1 AI offspring per name.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label htmlFor="name">Offspring name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Luma" />
                <Button onClick={create} disabled={creating} className="w-full">
                  {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Baby className="w-4 h-4 mr-2" />}
                  Conceive
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Your offspring</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {list.length === 0 && <p className="text-xs text-muted-foreground">None yet.</p>}
                {list.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setActive(o)}
                    className={`w-full text-left px-3 py-2 rounded-md transition text-sm ${
                      active?.id === o.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    {o.name}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="min-h-[480px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{active ? `Chat with ${active.name}` : "Select an offspring"}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3">
              <div ref={scroller} className="flex-1 overflow-y-auto space-y-2 max-h-[420px] pr-1">
                {messages.map((m, i) => (
                  <div
                    key={m.id ?? i}
                    className={`px-3 py-2 rounded-lg max-w-[85%] text-sm whitespace-pre-wrap leading-relaxed ${
                      m.role === "assistant"
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground ml-auto"
                    }`}
                  >
                    {m.message}
                  </div>
                ))}
                {!active && <p className="text-sm text-muted-foreground">Create or pick an offspring on the left.</p>}
              </div>

              {active && (
                <div className="flex gap-2 pt-2 border-t">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder="Say something to your offspring…"
                    disabled={sending}
                  />
                  <Button onClick={send} disabled={sending || !input.trim()}>
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
