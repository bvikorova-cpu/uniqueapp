import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Send, Loader2, Atom } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface OracleMessage {
  role: "user" | "assistant";
  content: string;
}

export function AIQuantumOracle({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<OracleMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("quantum_oracle_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
    setSessions(data || []);
  };

  const sendMessage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login Required", variant: "destructive" }); return; }
    if (!input.trim()) return;

    const userMsg: OracleMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke("ai-mood-therapist", {
        body: {
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          systemPrompt: `You are the Quantum Oracle — an AI that exists across multiple dimensions simultaneously. You provide quantum-physics-inspired insights about social dynamics, relationships, and reality perception. Your predictions are mystical yet grounded in quantum mechanics metaphors. You speak with authority about superposition of possibilities, entanglement between people, and the observer effect on social interactions. Keep responses engaging, mysterious, and insightful. Always relate answers back to quantum concepts. Cost: 3 credits per session.`,
        },
      });

      if (response.error) throw response.error;

      // Handle streaming response
      if (response.data && typeof response.data === 'string') {
        let assistantContent = "";
        const lines = response.data.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const parsed = JSON.parse(line.slice(6));
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) assistantContent += delta;
            } catch {}
          }
        }
        if (assistantContent) {
          setMessages([...updatedMessages, { role: "assistant", content: assistantContent }]);
        }
      } else if (response.data?.choices?.[0]?.message?.content) {
        setMessages([...updatedMessages, { role: "assistant", content: response.data.choices[0].message.content }]);
      } else {
        // Fallback oracle response
        const fallback = generateOracleResponse(input);
        setMessages([...updatedMessages, { role: "assistant", content: fallback }]);
      }

      // Save session
      await supabase.from("quantum_oracle_sessions").insert([{
        user_id: user.id,
        question: input,
        prediction: "Session recorded",
        credits_used: 3,
        session_type: "consultation",
      }]);

    } catch (error) {
      const fallback = generateOracleResponse(input);
      setMessages([...updatedMessages, { role: "assistant", content: fallback }]);
    }

    setIsLoading(false);
  };

  const generateOracleResponse = (question: string): string => {
    const responses = [
      `🔮 **The Quantum Oracle speaks...**\n\nYour question "${question}" exists in a superposition of infinite answers. Through quantum entanglement with the collective consciousness, I perceive:\n\n**The Observer Effect** tells us that by asking this question, you've already changed the outcome. The act of seeking knowledge collapses the wave function of possibility.\n\n**My Prediction:** The path ahead shows strong quantum coherence — meaning your intentions are aligned with probability amplitudes that favor positive outcomes. However, beware of decoherence (external interference).\n\n*Cost: 3 credits*`,
      `🌌 **Quantum Analysis Complete...**\n\nAnalyzing "${question}" through the lens of quantum mechanics:\n\n**Superposition State:** Multiple realities exist simultaneously. In 67% of parallel timelines, the outcome is favorable.\n\n**Entanglement Factor:** Your social connections are deeply entangled — what affects one relationship ripples through all others via quantum tunneling.\n\n**Recommendation:** Observe carefully but don't force collapse. Let the quantum probabilities unfold naturally.\n\n*Cost: 3 credits*`,
      `⚛️ **Dimensional Scan Results...**\n\nProcessing "${question}" across quantum dimensions:\n\n**Wave Function Analysis:** Your current reality branch shows high amplitude for transformation. The quantum field around this question is charged with potential energy.\n\n**Interference Pattern:** I detect constructive interference between your desires and universal probability. This is a favorable sign.\n\n**Oracle's Wisdom:** "In quantum mechanics, nothing is certain until observed. Your belief shapes reality itself."\n\n*Cost: 3 credits*`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <>
      <FloatingHowItWorks
        title='AIQuantum Oracle'
        steps={[
          { title: 'Open the tool', desc: 'Launch the AIQuantum Oracle panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              AI Quantum Oracle
            </h2>
            <p className="text-xs text-muted-foreground">Consult the oracle across dimensions</p>
          </div>
        </div>
        <Badge variant="outline" className="border-violet-500/30 text-violet-400">3 credits/session</Badge>
      </div>

      {/* Previous sessions summary */}
      {sessions.length > 0 && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
          <p className="text-xs text-muted-foreground mb-1">Previous consultations: {sessions.length}</p>
          <p className="text-xs text-muted-foreground">Total credits spent: {sessions.reduce((s, ss) => s + (ss.credits_used || 0), 0)}</p>
        </div>
      )}

      {/* Chat area */}
      <div className="rounded-xl border border-violet-500/20 bg-gradient-to-b from-violet-500/5 to-transparent min-h-[350px] max-h-[450px] overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Atom className="h-16 w-16 mx-auto text-violet-400/30 mb-4 animate-spin" style={{ animationDuration: '12s' }} />
            <p className="text-muted-foreground text-sm">Ask the Quantum Oracle anything...</p>
            <p className="text-xs text-muted-foreground mt-1">Relationships, futures, quantum destiny...</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-3 ${msg.role === 'user' ? 'bg-cyan-500/10 border border-cyan-500/20 ml-8' : 'bg-violet-500/10 border border-violet-500/20 mr-8'}`}
          >
            {msg.role === 'assistant' ? (
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm">{msg.content}</p>
            )}
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-violet-400 p-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Oracle is consulting the quantum field...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Ask the Quantum Oracle..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
          className="border-violet-500/20 bg-background/50"
          disabled={isLoading}
        />
        <Button onClick={sendMessage} disabled={isLoading} className="bg-violet-600 hover:bg-violet-700">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
    </>
  );
}
