import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Loader2, Send, Award } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_MOCKINTERVIEW = [
  { title: "Choose role & difficulty", desc: "Pick target job (e.g. Frontend Engineer) and level (Junior / Senior)." },
  { title: "Answer questions", desc: "AI asks 5-10 questions \u2014 reply by text or voice. Timer optional." },
  { title: "Get scored feedback", desc: "You receive a score per question + tips on clarity, structure and technical depth." },
  { title: "Retry weak areas", desc: "Bookmark questions you struggled with and re-run just those next time." },
];

type Msg = { role: "assistant" | "user"; content: string };

export default function MockInterview() {
  const [role, setRole] = useState("");
  const [type, setType] = useState("behavioral");
  const [started, setStarted] = useState(false);
  const [transcript, setTranscript] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number>(0);

  const start = async () => {
    if (!role) return toast.error("Enter role");
    setStarted(true); setStartedAt(Date.now());
    await ask([], "next_question");
  };

  const ask = async (current: Msg[], action: "next_question" | "evaluate") => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("mock-interview-ai", {
      body: { role, interview_type: type, transcript: current, action },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (action === "evaluate") {
      setFeedback(data.result);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await (supabase as any).from("mock_interview_sessions").insert({
        user_id: user.id, role, interview_type: type,
        transcript: current, feedback: data.result,
        duration_seconds: Math.round((Date.now() - startedAt) / 1000),
      });
    } else {
      setTranscript([...current, { role: "assistant", content: data.result }]);
    }
  };

  const send = async () => {
    if (!input.trim()) return;
    const next = [...transcript, { role: "user" as const, content: input }];
    setTranscript(next); setInput("");
    await ask(next, "next_question");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-8 space-y-4">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-blue-500/15 via-primary/10 to-cyan-500/5 border border-blue-500/20 p-6 flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-xl"><Mic className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-black">AI Mock Interview</h1>
          <p className="text-xs text-muted-foreground">Practice with an AI interviewer & get feedback.</p>
        </div>
      </motion.div>

      {!started ? (
        <Card><CardContent className="p-4 space-y-2">
          <Input placeholder="Target role (e.g. Senior React Engineer)" value={role} onChange={e => setRole(e.target.value)} />
          <select className="w-full bg-background border rounded-md p-2 text-sm" value={type} onChange={e => setType(e.target.value)}>
            <option value="behavioral">Behavioral</option>
            <option value="technical">Technical</option>
            <option value="system_design">System Design</option>
            <option value="culture_fit">Culture fit</option>
          </select>
          <Button className="w-full" onClick={start}>Start interview</Button>
        </CardContent></Card>
      ) : feedback ? (
        <Card><CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2"><Award className="h-6 w-6 text-amber-400" /><h2 className="font-black text-xl">Feedback</h2></div>
          <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{feedback}</ReactMarkdown></div>
          <Button onClick={() => { setStarted(false); setTranscript([]); setFeedback(null); }}>New session</Button>
        </CardContent></Card>
      ) : (
        <>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {transcript.map((m, i) => (
              <div key={i} className={`p-3 rounded-lg text-sm ${m.role === "assistant" ? "bg-blue-500/10 border border-blue-500/20" : "bg-muted ml-8"}`}>
                <p className="text-[10px] font-bold uppercase opacity-60 mb-1">{m.role === "assistant" ? "Interviewer" : "You"}</p>
                <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{m.content}</ReactMarkdown></div>
              </div>
            ))}
            {loading && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
          </div>
          <div className="flex gap-2">
            <Textarea placeholder="Your answer…" value={input} onChange={e => setInput(e.target.value)} rows={2} />
            <Button onClick={send} disabled={loading}><Send className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" className="w-full" onClick={() => ask(transcript, "evaluate")} disabled={loading || transcript.length < 2}>End & get feedback</Button>
        </>
      )}
    </div>
  );
}
