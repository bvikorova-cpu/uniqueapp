import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "sonner";
import { Loader2, BookOpen, ArrowLeft, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface DreamDictionaryProps {
  onBack: () => void;
}

const DreamDictionary = ({ onBack }: DreamDictionaryProps) => {
  const { credits, spendCredit } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const popularSymbols = ["Water", "Flying", "Teeth falling", "Being chased", "Snakes", "Fire", "Death", "Falling", "House", "Animals", "Baby", "Money"];

  const handleAnalyze = async () => {
    if (!symbol.trim()) {
      toast.error("Please enter a dream symbol");
      return;
    }
    if ((credits?.credits_remaining || 0) < 1) {
      toast.error("Insufficient credits. Please purchase more.");
      return;
    }
    setLoading(true);
    try {
      const used = await spendCredit("effect", "Dream Dictionary Lookup");
      if (!used) throw new Error("Failed to use credit");

      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("dream-ai", {
        body: { action: "dictionary", symbol, context },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      setResult(data.interpretation);
      toast.success("Symbol interpretation ready!");
    } catch (err: any) {
      toast.error(err.message || "Error analyzing symbol");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Dream Dictionary'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Dream Dictionary panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              AI Dream Dictionary
              <span className="text-xs font-normal text-muted-foreground ml-auto">1 Credit per lookup</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get personalized interpretations of dream symbols based on psychology, mythology, and your personal context. Unlike generic dream dictionaries, this AI learns from your unique life experiences.
            </p>

            <div>
              <label className="text-sm font-medium mb-2 block">Dream Symbol</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="e.g., Flying, Water, Teeth..."
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {popularSymbols.map(s => (
                <Button key={s} size="sm" variant={symbol === s ? "default" : "outline"}
                  onClick={() => setSymbol(s)} className="text-xs h-7">
                  {s}
                </Button>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Personal Context (optional)</label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Describe how this symbol appeared in your dream and any emotions you felt..."
                className="min-h-[80px] bg-background/50"
              />
            </div>

            <Button onClick={handleAnalyze} disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Analyzing Symbol..." : "Interpret Symbol (1 Credit)"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">📖 Symbol Interpretation: {symbol}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};

export default DreamDictionary;
