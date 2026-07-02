import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, MessageCircleQuestion } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  context: string;
  onCreditsChanged?: () => void;
}

interface AskResult {
  answer: string;
  analogy: string;
  didYouKnow: string;
  followUpQuestions: string[];
}

export const AskTheScientist = ({ context, onCreditsChanged }: Props) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResult | null>(null);

  const ask = async (q?: string) => {
    const finalQ = (q ?? question).trim();
    if (!finalQ) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("kids-science-helper", {
        body: { action: "askScientist", question: finalQ, context },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as AskResult);
      setQuestion("");
      onCreditsChanged?.();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to ask");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Ask The Scientist - How it works"} steps={[{ title: 'Open', desc: 'Access the Ask The Scientist section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Ask The Scientist.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <MessageCircleQuestion className="h-5 w-5 text-primary" />
            Ask the AI Scientist
          </span>
          <Badge variant="outline" className="text-xs">2 credits</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Why did that happen?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            disabled={loading}
          />
          <Button onClick={() => ask()} disabled={loading || !question.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          </Button>
        </div>

        {result && (
          <div className="space-y-3 text-sm bg-muted/30 rounded-lg p-3">
            <div>
              <p className="font-semibold mb-1">🧑‍🔬 Answer</p>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.answer}</p>
            </div>
            {result.analogy && (
              <div>
                <p className="font-semibold mb-1">💡 Think of it like…</p>
                <p className="text-muted-foreground">{result.analogy}</p>
              </div>
            )}
            {result.didYouKnow && (
              <div>
                <p className="font-semibold mb-1">✨ Did you know?</p>
                <p className="text-muted-foreground">{result.didYouKnow}</p>
              </div>
            )}
            {result.followUpQuestions?.length > 0 && (
              <div>
                <p className="font-semibold mb-1">🔁 Try asking</p>
                <div className="flex flex-wrap gap-2">
                  {result.followUpQuestions.map((q, i) => (
                    <Button key={i} size="sm" variant="outline" onClick={() => ask(q)} disabled={loading}>
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
