import { useState } from "react";
import { useTutorChat } from "@/hooks/useEducationNotes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useHomeworkCredits } from "@/hooks/useHomeworkCredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_AITUTOR_STEPS = [
  { title: 'Type your question', desc: 'Text, formula or photo — the tutor understands all three.' },
  { title: 'Read the walkthrough', desc: 'Answers include the full reasoning, not just the result.' },
  { title: 'Ask follow-ups', desc: 'Keep the thread going until it clicks.' },
  { title: 'Save to Notes', desc: 'Push valuable answers to your Notes for later revision.' }
];
const __HIW_AITUTOR = { title: 'AI Tutor', intro: 'Ask any study question and get step-by-step explanations.', steps: __HIW_AITUTOR_STEPS };


interface Msg { role: "user" | "assistant"; content: string; }

export default function AITutor() {
  const chat = useTutorChat();
  const credits = useHomeworkCredits();
  const [input, setInput] = useState("");
  const [context, setContext] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);

  const send = async () => {
    if (!input.trim()) return;
    const user = input;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: user }]);
    const res = await chat.mutateAsync({ message: user, context });
    setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    credits.refresh();
  };

  return (
    <>
      <FloatingHowItWorks title={__HIW_AITUTOR.title} intro={__HIW_AITUTOR.intro} steps={__HIW_AITUTOR.steps} />
      <Helmet><title>AI Tutor · Education</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-black">AI Tutor</h1>
          <span className="ml-auto text-sm text-muted-foreground">{credits.credits_remaining} credits</span>
        </div>

        <Input
          className="mb-3"
          placeholder="Optional: course / lesson context (subject, level...)"
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />

        <Card className="backdrop-blur-xl bg-card/80 mb-3 min-h-[400px]">
          <CardContent className="p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-muted-foreground text-center py-10">Ask any question. Cost: 3 credits per reply.</p>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`p-3 rounded-lg ${m.role === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-8"}`}>
                  <div className="text-xs uppercase text-muted-foreground mb-1">{m.role}</div>
                  <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                </div>
              ))
            )}
            {chat.isPending && <p className="text-sm text-muted-foreground">Thinking...</p>}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Input
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <Button onClick={send} disabled={chat.isPending || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
