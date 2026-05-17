import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const COST = 2;

interface Msg { role: "user" | "mentor"; content: string; }
interface Props { onCredits?: () => void; context?: string; }

export const AskCareerMentor = ({ onCredits, context }: Props) => {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Msg[]>([]);

  const ask = async () => {
    if (!q.trim()) return;
    const question = q.trim();
    setQ("");
    setHistory(h => [...h, { role: "user", content: question }]);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("teen-career-counselor", {
        body: { action: "mentor", question, context },
      });
      if (error || data?.error) {
        const msg = data?.error || error?.message || "Failed";
        if (String(msg).toLowerCase().includes("insufficient")) toast.error(`Need ${COST} credits`);
        else toast.error(msg);
        return;
      }
      setHistory(h => [...h, { role: "mentor", content: data.reply }]);
      onCredits?.();
    } finally { setLoading(false); }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" /> Ask a Career Mentor
          <span className="ml-auto text-[10px] font-normal text-muted-foreground">{COST} cr / question</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.length > 0 && (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {history.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-2xl text-sm ${m.role === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-8"}`}>
                <div className="text-[10px] font-bold uppercase tracking-wide mb-1 text-muted-foreground">
                  {m.role === "user" ? "You" : "Mentor"}
                </div>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </motion.div>
            ))}
          </div>
        )}

        <Textarea placeholder="Ask anything: 'Should I study CS or design?' 'How do I get my first internship?'" rows={2} value={q} onChange={e => setQ(e.target.value)} />
        <Button onClick={ask} disabled={loading || !q.trim()} className="w-full gap-1">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Ask mentor
        </Button>
      </CardContent>
    </Card>
  );
};
